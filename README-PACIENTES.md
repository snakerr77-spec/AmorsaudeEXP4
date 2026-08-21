# Central de Pacientes - LAG Controller

Implementação pronta para o repositório AmorsaudeEXP4.

## O que adiciona
- Aba Pacientes na homepage para administradores.
- Busca por nome, telefone e nascimento.
- Histórico de todos os prontuários do paciente.
- Agrupamento dos registros por médico.
- Download de um PDF separado para cada médico.
- PDF com queixa, anamnese, sinais vitais, alergias, medicamentos, exame físico, diagnóstico/CID, conduta, exames solicitados, prescrição e informações de dor.

## Aplicar
Abra PowerShell na raiz do repositório e execute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\aplicar-pacientes.ps1
```

Depois:

```powershell
git status
git add public/js/home.js public/modules/pacientes
git commit -m "Adiciona central de pacientes e PDF por medico"
git pull --rebase origin main
git push origin main
```
