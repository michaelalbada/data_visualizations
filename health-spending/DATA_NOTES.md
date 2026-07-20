# America's Health Dollar — data notes

The visualization is generated from the Centers for Medicare & Medicaid Services file **National Health Expenditures by Type of Service and Source of Funds, CY 1960–2024**.

Source page: <https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/historical>

The source workbook reports millions of current-year dollars. The generator groups the detailed accounts into eight payer families and ten destinations. It preserves the published national total for every year; the small one-million-dollar component discrepancies created by CMS table rounding are absorbed into “Other payers & programs.”

“Other direct public funding” covers the federal, state, and local funds reported directly for public health, research, structures, and equipment. “Private research & capital” covers private funding reported for research, structures, and equipment. Medicare, Medicaid, CHIP, Defense, and Veterans Affairs remain separate payer families.

To refresh the generated data:

```sh
curl -L -o /tmp/nhe.zip https://www.cms.gov/files/zip/national-health-expenditures-type-service-source-funds-cy-1960-2024.zip
unzip -o /tmp/nhe.zip -d /tmp/nhe
node health-spending/scripts/build-health-spending-data.mjs /tmp/nhe/NHE2024.csv
```
