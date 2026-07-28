import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileHeart,
  FilePlus2,
  Filter,
  HeartPulse,
  History,
  LoaderCircle,
  MapPin,
  Pill,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  X
} from "../components/icons";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "../components/AppShell";
import { createMedicalRecord, deleteMedicalRecord, listMedicalRecords, logout } from "../lib/api";
import { displayName } from "../lib/session";
import type { LagUser, MedicalRecord } from "../types";

interface MedicalRecordPageProps {
  user: LagUser;
}

type MedicalTab = "new" | "today" | "history";

type FormState = Omit<MedicalRecord, "painAreas" | "city">;

const specialties = [
  "Clínico geral",
  "Cardiologia",
  "Dermatologia",
  "Ginecologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Outra"
];

const painPoints = [
  { label: "Cabeça frontal", x: 25, y: 8 },
  { label: "Face", x: 25, y: 11 },
  { label: "Pescoço frontal", x: 25, y: 16 },
  { label: "Ombro esquerdo frontal", x: 15, y: 20 },
  { label: "Ombro direito frontal", x: 35, y: 20 },
  { label: "Peito", x: 27, y: 25 },
  { label: "Abdômen", x: 25, y: 36 },
  { label: "Quadril frontal", x: 25, y: 45 },
  { label: "Braço esquerdo frontal", x: 10, y: 35 },
  { label: "Braço direito frontal", x: 40, y: 35 },
  { label: "Joelho esquerdo frontal", x: 19, y: 66 },
  { label: "Joelho direito frontal", x: 31, y: 66 },
  { label: "Tornozelo esquerdo frontal", x: 18, y: 83 },
  { label: "Tornozelo direito frontal", x: 32, y: 83 },
  { label: "Cabeça posterior", x: 74, y: 8 },
  { label: "Cervical", x: 74, y: 16 },
  { label: "Ombro esquerdo posterior", x: 63, y: 21 },
  { label: "Ombro direito posterior", x: 85, y: 21 },
  { label: "Coluna torácica", x: 74, y: 28 },
  { label: "Lombar", x: 74, y: 40 },
  { label: "Quadril posterior", x: 74, y: 49 },
  { label: "Braço esquerdo posterior", x: 58, y: 35 },
  { label: "Braço direito posterior", x: 90, y: 35 },
  { label: "Joelho esquerdo posterior", x: 68, y: 66 },
  { label: "Joelho direito posterior", x: 80, y: 66 }
];

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function initialForm(user: LagUser): FormState {
  const name = displayName(user);
  const doctorName = /^dr(a)?\.?\s/i.test(name) ? name : "";

  return {
    patient: "",
    birthDate: "",
    phone: "",
    doctor: doctorName,
    specialty: user.setor || "",
    visitDate: localDate(),
    visitTime: localTime(),
    painLevel: "0",
    painType: "Não informado",
    symptomStart: "",
    complaint: "",
    anamnesis: "",
    vitals: "",
    allergies: "",
    medicines: "",
    physicalExam: "",
    diagnosis: "",
    conduct: "",
    requestedTests: "",
    prescription: "",
    createdBy: user.id || user.uid || "",
    createdByName: displayName(user),
    createdByEmail: user.email || "",
    createdAtISO: new Date().toISOString()
  };
}

function formatDate(value?: string) {
  if (!value) return "Sem data";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function phoneMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function MedicalRecordPage({ user }: MedicalRecordPageProps) {
  const [tab, setTab] = useState<MedicalTab>("new");
  const [form, setForm] = useState<FormState>(() => initialForm(user));
  const [painAreas, setPainAreas] = useState<string[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });
  const [query, setQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const city = user.cidade || localStorage.getItem("amorSaudeCidadeSelecionada") || "Cerquilho";

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMedicalRecords();
      setRecords(
        [...data].sort((a, b) =>
          String(b.createdAtISO || b.createdAt || "").localeCompare(String(a.createdAtISO || a.createdAt || ""))
        )
      );
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : "Não foi possível carregar os prontuários.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const todayRecords = useMemo(() => records.filter((record) => record.visitDate === localDate()), [records]);
  const monthRecords = useMemo(() => {
    const month = localDate().slice(0, 7);
    return records.filter((record) => String(record.visitDate || "").startsWith(month));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const source = tab === "today" ? todayRecords : monthRecords;
    const term = query.trim().toLowerCase();
    if (!term) return source;
    return source.filter((record) =>
      `${record.patient} ${record.doctor} ${record.specialty} ${record.diagnosis} ${record.phone}`
        .toLowerCase()
        .includes(term)
    );
  }, [monthRecords, query, tab, todayRecords]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePain(label: string) {
    setPainAreas((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  function resetForm(showMessage = true) {
    setForm(initialForm(user));
    setPainAreas([]);
    if (showMessage) setStatus({ text: "Ficha limpa. Você pode iniciar um novo atendimento.", type: "" });
  }

  async function submitRecord(event: FormEvent) {
    event.preventDefault();
    if (!form.patient.trim()) {
      setStatus({ text: "Informe o nome do paciente.", type: "error" });
      return;
    }
    if (!form.doctor.trim()) {
      setStatus({ text: "Informe o médico responsável.", type: "error" });
      return;
    }

    const record: MedicalRecord = {
      ...form,
      patient: form.patient.trim(),
      doctor: form.doctor.trim(),
      city,
      painAreas,
      createdAtISO: new Date().toISOString()
    };

    setSaving(true);
    setStatus({ text: "Salvando prontuário...", type: "" });
    try {
      await createMedicalRecord(record);
      resetForm(false);
      setStatus({ text: "Prontuário salvo com sucesso.", type: "success" });
      await loadRecords();
      setTab("today");
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : "Não foi possível salvar o prontuário.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(record: MedicalRecord) {
    if (!record.id) return;
    if (!window.confirm(`Excluir o prontuário de ${record.patient}?`)) return;
    try {
      await deleteMedicalRecord(record.id);
      setSelectedRecord(null);
      setStatus({ text: "Prontuário excluído.", type: "success" });
      await loadRecords();
    } catch (error) {
      setStatus({ text: error instanceof Error ? error.message : "Não foi possível excluir.", type: "error" });
    }
  }

  function printRecord(record: MedicalRecord) {
    const popup = window.open("", "_blank", "width=920,height=760");
    if (!popup) {
      setStatus({ text: "Permita pop-ups no navegador para imprimir.", type: "error" });
      return;
    }
    const areas = record.painAreas?.length ? record.painAreas.join(", ") : "Não informado";
    const paragraphs = [
      ["Queixa principal", record.complaint],
      ["Anamnese", record.anamnesis],
      ["Sinais vitais", record.vitals],
      ["Alergias", record.allergies],
      ["Medicamentos em uso", record.medicines],
      ["Exame físico", record.physicalExam],
      ["Hipótese diagnóstica / CID", record.diagnosis],
      ["Conduta médica", record.conduct],
      ["Exames solicitados", record.requestedTests],
      ["Prescrição", record.prescription]
    ];
    const escape = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);

    popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Prontuário - ${escape(record.patient)}</title><style>body{font-family:Arial,sans-serif;color:#17324d;padding:40px;line-height:1.55}header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0a9ca0;padding-bottom:18px;margin-bottom:24px}h1{font-size:26px;margin:0;color:#062653}h2{font-size:15px;color:#087f86;margin:22px 0 6px;text-transform:uppercase;letter-spacing:.05em}p{white-space:pre-wrap;margin:4px 0}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;background:#f3fafb;padding:18px;border-radius:14px}.sign{margin-top:70px;border-top:1px solid #8294a4;padding-top:8px;width:320px}</style></head><body><header><div><h1>Prontuário médico</h1><p>LAG Controller • Unidade ${escape(record.city)}</p></div><strong>${escape(formatDate(record.visitDate))} ${escape(record.visitTime)}</strong></header><section class="meta"><p><b>Paciente:</b> ${escape(record.patient)}</p><p><b>Nascimento:</b> ${escape(formatDate(record.birthDate))}</p><p><b>Telefone:</b> ${escape(record.phone || "Não informado")}</p><p><b>Médico:</b> ${escape(record.doctor)}</p><p><b>Especialidade:</b> ${escape(record.specialty || "Não informado")}</p><p><b>Dor:</b> ${escape(record.painLevel)}/10 • ${escape(record.painType)}</p><p style="grid-column:1/-1"><b>Locais da dor:</b> ${escape(areas)}</p></section>${paragraphs.map(([label, value]) => `<h2>${escape(label)}</h2><p>${escape(value || "Não informado")}</p>`).join("")}<div class="sign"><b>Assinatura e carimbo do médico</b></div></body></html>`);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 250);
  }

  async function handleLogout() {
    await logout();
    window.location.replace("/pages/login");
  }

  return (
    <AppShell user={user} title="Prontuário médico" section="Área médica" compact>
      <div className="medical-react-page page-container">
        <motion.div className="medical-breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <a href="/pages/home"><ArrowLeft size={16} /> Voltar para home</a>
          <span>/</span>
          <strong>Prontuário médico</strong>
        </motion.div>

        <motion.section
          className="medical-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="medical-hero-copy">
            <span className="eyebrow"><HeartPulse size={15} /> Atendimento clínico</span>
            <h1>Prontuário médico <strong>mais claro e rápido.</strong></h1>
            <p>Registre o atendimento, marque regiões de dor e consulte o histórico do paciente sem sair da mesma tela.</p>
            <div className="medical-hero-meta">
              <span><MapPin size={15} /> Unidade {city}</span>
              <span><Stethoscope size={15} /> {displayName(user)}</span>
              <span><ShieldStatus /> Sessão clínica protegida</span>
            </div>
          </div>
          <div className="medical-hero-stats">
            <article><span><CalendarDays size={19} /></span><div><strong>{todayRecords.length}</strong><small>Atendimentos hoje</small></div></article>
            <article><span><History size={19} /></span><div><strong>{monthRecords.length}</strong><small>Registros no mês</small></div></article>
            <article><span><Activity size={19} /></span><div><strong>{records.length}</strong><small>Total cadastrado</small></div></article>
          </div>
        </motion.section>

        <section className="medical-workspace">
          <aside className="medical-side-nav">
            <div className="medical-side-title"><span>Fluxo de atendimento</span><h2>Área médica</h2></div>
            {[
              { id: "new" as const, icon: FilePlus2, title: "Novo prontuário", text: "Registrar atendimento" },
              { id: "today" as const, icon: Clock3, title: "Pacientes do dia", text: `${todayRecords.length} registro${todayRecords.length === 1 ? "" : "s"}` },
              { id: "history" as const, icon: History, title: "Histórico mensal", text: `${monthRecords.length} registro${monthRecords.length === 1 ? "" : "s"}` }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                  <span><Icon size={19} /></span>
                  <div><strong>{item.title}</strong><small>{item.text}</small></div>
                  <ChevronDown size={16} />
                </button>
              );
            })}

            <div className="medical-user-mini">
              <span><UserRound size={19} /></span>
              <div><strong>{displayName(user)}</strong><small>{user.email || "Conta clínica"}</small></div>
            </div>
            <button className="medical-logout-link" type="button" onClick={handleLogout}>Sair da conta</button>
          </aside>

          <div className="medical-content">
            <AnimatePresence mode="wait">
              {tab === "new" ? (
                <motion.div key="new" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <form className="medical-form-layout" onSubmit={submitRecord}>
                    <div className="medical-form-column">
                      <SectionCard icon={UserRound} kicker="Identificação" title="Paciente e atendimento">
                        <div className="medical-form-grid three">
                          <Field label="Nome completo" required><input value={form.patient} onChange={(event) => updateField("patient", event.target.value)} placeholder="Nome do paciente" /></Field>
                          <Field label="Data de nascimento"><input type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} /></Field>
                          <Field label="Telefone"><input value={form.phone} onChange={(event) => updateField("phone", phoneMask(event.target.value))} placeholder="(00) 00000-0000" /></Field>
                          <Field label="Médico responsável" required><input value={form.doctor} onChange={(event) => updateField("doctor", event.target.value)} placeholder="Dr(a). Nome" /></Field>
                          <Field label="Especialidade"><select value={form.specialty} onChange={(event) => updateField("specialty", event.target.value)}><option value="">Selecione</option>{specialties.map((item) => <option key={item}>{item}</option>)}</select></Field>
                          <div className="medical-field-row"><Field label="Data"><input type="date" value={form.visitDate} onChange={(event) => updateField("visitDate", event.target.value)} /></Field><Field label="Horário"><input type="time" value={form.visitTime} onChange={(event) => updateField("visitTime", event.target.value)} /></Field></div>
                        </div>
                      </SectionCard>

                      <SectionCard icon={HeartPulse} kicker="Anamnese" title="Sintomas e história clínica">
                        <div className="pain-summary-row">
                          <div className="pain-scale">
                            <div><span>Intensidade da dor</span><strong>{form.painLevel}/10</strong></div>
                            <input type="range" min="0" max="10" value={form.painLevel} onChange={(event) => updateField("painLevel", event.target.value)} />
                            <div className="pain-scale-labels"><span>Sem dor</span><span>Moderada</span><span>Intensa</span></div>
                          </div>
                          <Field label="Tipo da dor"><select value={form.painType} onChange={(event) => updateField("painType", event.target.value)}><option>Não informado</option><option>Aguda</option><option>Crônica</option><option>Pontada</option><option>Queimação</option><option>Pressão</option><option>Choque</option><option>Latejante</option></select></Field>
                          <Field label="Início dos sintomas"><input value={form.symptomStart} onChange={(event) => updateField("symptomStart", event.target.value)} placeholder="Ex: há 3 dias" /></Field>
                        </div>
                        <Field label="Queixa principal"><textarea value={form.complaint} onChange={(event) => updateField("complaint", event.target.value)} placeholder="Descreva o motivo da consulta" /></Field>
                        <Field label="Anamnese"><textarea className="large" value={form.anamnesis} onChange={(event) => updateField("anamnesis", event.target.value)} placeholder="História da doença atual, antecedentes, hábitos e observações relevantes" /></Field>
                      </SectionCard>

                      <SectionCard icon={ClipboardList} kicker="Avaliação" title="Exame clínico">
                        <div className="medical-form-grid two">
                          <Field label="Sinais vitais"><textarea value={form.vitals} onChange={(event) => updateField("vitals", event.target.value)} placeholder="PA, FC, FR, temperatura, saturação" /></Field>
                          <Field label="Alergias"><textarea value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} placeholder="Medicamentos, alimentos ou outras alergias" /></Field>
                          <Field label="Medicamentos em uso"><textarea value={form.medicines} onChange={(event) => updateField("medicines", event.target.value)} placeholder="Medicamentos e doses atuais" /></Field>
                          <Field label="Exame físico"><textarea value={form.physicalExam} onChange={(event) => updateField("physicalExam", event.target.value)} placeholder="Achados do exame físico" /></Field>
                        </div>
                      </SectionCard>

                      <SectionCard icon={Pill} kicker="Plano terapêutico" title="Diagnóstico e conduta">
                        <Field label="Hipótese diagnóstica / CID"><textarea value={form.diagnosis} onChange={(event) => updateField("diagnosis", event.target.value)} placeholder="Hipótese diagnóstica, CID e observações" /></Field>
                        <Field label="Conduta médica"><textarea value={form.conduct} onChange={(event) => updateField("conduct", event.target.value)} placeholder="Orientações, retorno, encaminhamento ou afastamento" /></Field>
                        <div className="medical-form-grid two">
                          <Field label="Exames solicitados"><textarea value={form.requestedTests} onChange={(event) => updateField("requestedTests", event.target.value)} placeholder="Exames laboratoriais, imagem ou outros" /></Field>
                          <Field label="Prescrição"><textarea value={form.prescription} onChange={(event) => updateField("prescription", event.target.value)} placeholder="Medicações e posologia" /></Field>
                        </div>
                      </SectionCard>
                    </div>

                    <aside className="medical-map-column">
                      <div className="body-map-card">
                        <div className="body-map-head"><div><span>Mapa corporal</span><h2>Onde o paciente sente dor?</h2><p>Selecione uma ou mais regiões no corpo.</p></div><MapPin size={24} /></div>
                        <div className="body-map-stage">
                          <img src="/assets/images/anatomia-frente-costas.png" alt="Mapa corporal frontal e posterior" />
                          {painPoints.map((point) => (
                            <button
                              key={point.label}
                              type="button"
                              className={painAreas.includes(point.label) ? "pain-point active" : "pain-point"}
                              style={{ left: `${point.x}%`, top: `${point.y}%` }}
                              onClick={() => togglePain(point.label)}
                              aria-label={point.label}
                              title={point.label}
                            >
                              <span />
                            </button>
                          ))}
                        </div>
                        <div className="selected-areas">
                          <div><strong>Regiões selecionadas</strong><small>{painAreas.length} ponto{painAreas.length === 1 ? "" : "s"}</small></div>
                          {painAreas.length ? <div className="selected-area-chips">{painAreas.map((area) => <button key={area} type="button" onClick={() => togglePain(area)}>{area}<X size={13} /></button>)}</div> : <p>Nenhuma região selecionada.</p>}
                          {painAreas.length ? <button className="clear-pain" type="button" onClick={() => setPainAreas([])}>Limpar marcações</button> : null}
                        </div>
                      </div>

                      <div className="medical-sticky-actions">
                        {status.text ? <div className={`medical-status ${status.type}`}>
                          {status.type === "success" ? <CheckCircle2 size={18} /> : status.type === "error" ? <AlertCircle size={18} /> : <Activity size={18} />}
                          <span>{status.text}</span>
                        </div> : null}
                        <button className="save-record-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={19} /> : <Save size={19} />} {saving ? "Salvando..." : "Salvar prontuário"}</button>
                        <div><button type="button" onClick={() => printRecord({ ...form, city, painAreas })}><Printer size={17} /> Visualizar impressão</button><button type="button" onClick={resetForm}><RotateCcw size={17} /> Limpar ficha</button></div>
                      </div>
                    </aside>
                  </form>
                </motion.div>
              ) : (
                <motion.div key={tab} className="medical-history-view" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="medical-history-head">
                    <div><span>{tab === "today" ? "Atendimentos de hoje" : "Histórico mensal"}</span><h2>{tab === "today" ? "Pacientes registrados no dia" : "Prontuários do mês atual"}</h2><p>{filteredRecords.length} resultado{filteredRecords.length === 1 ? "" : "s"} encontrado{filteredRecords.length === 1 ? "" : "s"}.</p></div>
                    <button type="button" onClick={() => void loadRecords()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={17} /> Atualizar</button>
                  </div>
                  <div className="history-toolbar">
                    <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar paciente, médico, diagnóstico..." /></label>
                    <span><Filter size={16} /> {tab === "today" ? formatDate(localDate()) : new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date())}</span>
                  </div>

                  {loading ? <div className="records-loading"><LoaderCircle className="spin" size={28} /><strong>Carregando prontuários...</strong></div> : filteredRecords.length ? (
                    <div className="record-list-react">
                      {filteredRecords.map((record, index) => (
                        <motion.article key={record.id || `${record.patient}-${index}`} className="record-card-react" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.035, 0.24) }}>
                          <div className="record-avatar">{record.patient?.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P"}</div>
                          <div className="record-main-info"><strong>{record.patient || "Paciente sem nome"}</strong><p>{record.specialty || "Especialidade não informada"} • {record.doctor || "Médico não informado"}</p><small><CalendarDays size={13} /> {formatDate(record.visitDate)} às {record.visitTime || "--:--"}<span />Dor {record.painLevel || "0"}/10</small></div>
                          <div className="record-diagnosis"><span>Diagnóstico / CID</span><p>{record.diagnosis || "Não informado"}</p></div>
                          <div className="record-actions"><button type="button" onClick={() => setSelectedRecord(record)}>Ver prontuário</button><button type="button" onClick={() => printRecord(record)} aria-label="Imprimir"><Printer size={17} /></button></div>
                        </motion.article>
                      ))}
                    </div>
                  ) : <div className="records-empty"><FileHeart size={34} /><h3>Nenhum prontuário encontrado</h3><p>Não há registros nesse período ou com o termo pesquisado.</p><button type="button" onClick={() => { setQuery(""); setTab("new"); }}>Criar novo prontuário</button></div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedRecord ? (
          <>
            <motion.button className="record-modal-backdrop" type="button" aria-label="Fechar prontuário" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRecord(null)} />
            <motion.aside className="record-detail-modal" initial={{ x: 620 }} animate={{ x: 0 }} exit={{ x: 620 }} transition={{ type: "spring", stiffness: 280, damping: 32 }}>
              <div className="record-detail-head"><div><span>Prontuário completo</span><h2>{selectedRecord.patient}</h2><p>{formatDate(selectedRecord.visitDate)} às {selectedRecord.visitTime}</p></div><button type="button" onClick={() => setSelectedRecord(null)}><X size={20} /></button></div>
              <div className="record-detail-meta"><span><Stethoscope size={15} /> {selectedRecord.doctor}</span><span><MapPin size={15} /> {selectedRecord.city}</span><span><HeartPulse size={15} /> Dor {selectedRecord.painLevel}/10</span></div>
              <div className="record-detail-content">
                <Detail label="Nascimento" value={formatDate(selectedRecord.birthDate)} />
                <Detail label="Telefone" value={selectedRecord.phone} />
                <Detail label="Especialidade" value={selectedRecord.specialty} />
                <Detail label="Regiões de dor" value={selectedRecord.painAreas?.join(", ")} wide />
                <Detail label="Queixa principal" value={selectedRecord.complaint} wide />
                <Detail label="Anamnese" value={selectedRecord.anamnesis} wide />
                <Detail label="Sinais vitais" value={selectedRecord.vitals} />
                <Detail label="Alergias" value={selectedRecord.allergies} />
                <Detail label="Medicamentos em uso" value={selectedRecord.medicines} />
                <Detail label="Exame físico" value={selectedRecord.physicalExam} wide />
                <Detail label="Hipótese diagnóstica / CID" value={selectedRecord.diagnosis} wide />
                <Detail label="Conduta médica" value={selectedRecord.conduct} wide />
                <Detail label="Exames solicitados" value={selectedRecord.requestedTests} wide />
                <Detail label="Prescrição" value={selectedRecord.prescription} wide />
              </div>
              <div className="record-detail-actions"><button type="button" onClick={() => printRecord(selectedRecord)}><Printer size={17} /> Imprimir</button><button className="danger" type="button" onClick={() => void removeRecord(selectedRecord)}><Trash2 size={17} /> Excluir</button></div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function ShieldStatus() {
  return <span className="shield-status-icon"><CheckCircle2 size={15} /></span>;
}

function SectionCard({ icon: Icon, kicker, title, children }: { icon: typeof UserRound; kicker: string; title: string; children: import("react").ReactNode }) {
  return <section className="medical-section-card"><div className="medical-section-title"><span><Icon size={19} /></span><div><small>{kicker}</small><h2>{title}</h2></div></div><div className="medical-section-content">{children}</div></section>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: import("react").ReactNode }) {
  return <label className="medical-field"><span>{label}{required ? <b> *</b> : null}</span>{children}</label>;
}

function Detail({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return <div className={`record-detail-item${wide ? " wide" : ""}`}><span>{label}</span><p>{value || "Não informado"}</p></div>;
}
