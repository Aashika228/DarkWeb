import sys
import json
import pandas as pd

query = sys.argv[1].lower()
qtype = sys.argv[2].lower()  # 'email' or 'domain'

df = pd.read_csv('./data/IET.csv', low_memory=False)
df = df.loc[:, ~df.columns.str.startswith('Unnamed')]
df['Domain'] = df['Domain'].fillna('').astype(str)
df['UserID'] = df['UserID'].fillna('').astype(str)
df['Password'] = df['Password'].fillna('').astype(str)

if qtype == 'email':
    matches = df[df['UserID'].str.lower().str.contains(query, na=False)]
else:
    matches = df[df['Domain'].str.lower().str.contains(query, na=False)]

results = []
for _, row in matches.head(20).iterrows():
    results.append({
        "source":     row['Domain'],
        "content":    f"UserID: {row['UserID']} Password: [REDACTED]",
        "risk_level": "critical",
        "findings": {
            "types": ["email", "password"],
            "explanation": f"Credentials found in IET breach dataset for domain {row['Domain']}"
        }
    })

print(json.dumps(results))