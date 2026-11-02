# Skills

Custom skills I built and use in my work: Claude skills that I created as live demos for my AI training sessions with company teams, and Hermes Agent skills that run my self-hosted services.

Each skill turns a repetitive task into a repeatable instruction. That is the idea I teach in my training sessions: once a team sees its own task done by a skill, it starts finding the next one to automate.

The skill files are written in Spanish, because they were built for Spanish-speaking teams. The example data is invented.

## Claude skills

| Skill | What it does |
|---|---|
| [`planilla_ventas`](Claude/planilla_ventas/) | A plugin with two skills for the monthly sales close, working from an Excel file with a `ventas` sheet. **`ventas-mes`** creates the sheet for the month you name, with live Excel formulas (SUMIFS, INDEX/MATCH), checks the results by recalculating a copy with LibreOffice, and uploads a CSV copy to Google Drive. **`ventas-mes-informe`** writes a short narrative report of the month (totals, top and bottom product lines, week-over-week changes) and publishes it as a Notion page through the Notion connector. Includes a sample file with simulated data (`simulacion_ventas.xlsx`). |
| [`Informe_incidencias`](Claude/Informe_incidencias/) | Turns messy notes about a quality incident in a factory into a standard 9-section incident report in Word (.docx). Claude extracts the data into a fixed JSON schema and a Node.js script (`docx` library) generates the document with the same layout as the reference model. Missing data is marked as pending instead of invented, and the severity and root cause are always shown as a proposal for the Quality team to confirm. |
| [`sort_images`](Claude/sort_images/) | Sorts a folder of photos with meaningless file names into subfolders by subject (for example, one folder per animal). I showed Claude the procedure once, and the skill repeats the same steps for any other subject. It asks the user only when a photo shows more than one subject. |

## Hermes Agent skills

DevOps skills for [Hermes Agent](Hermes/) running on a Raspberry Pi, where my services run with Docker Compose.

| Skill | What it does |
|---|---|
| [`manage-n8n`](Hermes/manage-n8n/) | Starts and stops my self-hosted n8n instance. |
| [`update-n8n`](Hermes/update-n8n/) | Updates n8n to the latest image (stop, pull, start) and checks that the service is running. |
| [`manage-prestashop`](Hermes/manage-prestashop/) | Starts and stops a local PrestaShop store. |
| [`manage-tvguide`](Hermes/manage-tvguide/) | Starts and stops a personal web app. |
| [`system-reboot`](Hermes/system-reboot/) | Reboots the Raspberry Pi safely through a dedicated script, only after explicit confirmation from the user. |

## Design choices worth noting

- **Verify, do not assume.** `ventas-mes` never trusts its own output: it recalculates a copy of the file to confirm the formulas return real numbers before delivering it.
- **Upload text, not binaries.** The Drive connector receives file content as text, so a base64 `.xlsx` gets truncated. The skill uploads a CSV with the calculated values instead.
- **Never invent data.** The incident report leaves missing fields as `[pendiente]` and labels severity and root cause as proposals.
- **Ask before risky actions.** The reboot skill always asks for confirmation, and the image sorter asks when a photo is ambiguous.

## Author

Sebastián Jaimovich, AI trainer and automation consultant ([IA y Café](https://www.iaycafe.uk/)), Valencia, Spain.
