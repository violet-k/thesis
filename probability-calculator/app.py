import math
import pandas as pd
import numpy as np

df = pd.read_csv("converted.csv")


def calculate_hcm_probability(row, df):
    sire_id, dam_id = row["Sire_ID"], row["Dam_ID"]

    if pd.isna(sire_id) and pd.isna(dam_id):
        return 0.0

    sire_prob, dam_prob = 0.0, 0.0

    if not pd.isna(sire_id):
        sire_id = int(sire_id)
        sire_row = df[df["ID"] == sire_id].iloc[0]
        sire_prob = 0.5 * (
            float(sire_row["Sire_has_HCM"]) + calculate_hcm_probability(sire_row, df)
        )

    if not pd.isna(dam_id):
        dam_id = int(dam_id)
        dam_row = df[df["ID"] == dam_id].iloc[0]
        dam_prob = 0.5 * (
            float(dam_row["Dam_has_HCM"]) + calculate_hcm_probability(dam_row, df)
        )

    return sire_prob + dam_prob


df["Probability"] = df.apply(lambda row: calculate_hcm_probability(row, df), axis=1)
df.to_csv("results.csv", index=False)
