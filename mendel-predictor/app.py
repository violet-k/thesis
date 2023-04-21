import math
import pandas as pd
import numpy as np

df = pd.read_csv("converted.csv")


ids = [
    284415,
    391637,
    134407,
    301486,
    179270,
    128397,
    404550,
    257571,
    289857,
    240916,
    185330,
    396336,
    372628,
    278731,
    257499,
    124277,
    373949,
    328009,
    372828,
]

data = df.loc[df["ID"].isin(ids)]


threshold = 0.25
data["Has_HCM_Mendel"] = np.nan
data.loc[data["Has_HCM"] == 0, "Has_HCM"] = 0.5
data.loc[data["Has_HCM"] == 1, "Has_HCM"] = 1
data.loc[data["Sire_ID"].isnull(), "Has_HCM_Mendel"] = data["Has_HCM"]


tree = {}
for r in data.to_dict("records"):
    tree[r["ID"]] = r
print(tree)


def get_probability(tree, child_id):
    if not math.isnan(tree[child_id]["Has_HCM_Mendel"]):
        return tree[child_id]["Has_HCM_Mendel"]

    sire_id = tree[child_id]["Sire_ID"]
    dam_id = tree[child_id]["Dam_ID"]

    sire_prob = get_probability(tree, sire_id)
    dam_prob = get_probability(tree, dam_id)
    print(sire_prob, dam_prob)

    affected_prob = sire_prob * dam_prob
    unaffected_prob = (1 - sire_prob) * (1 - dam_prob)

    # Hardy-Weinberg equilibrium
    p = unaffected_prob**0.5
    q = affected_prob**0.5

    # Calculate disease probabilities
    prob_homozygous_dominant = p**2
    prob_heterozygous = 2 * p * q
    prob_homozygous_recessive = q**2

    prob = (sire_prob + dam_prob) / 2

    print(
        f"{child_id} {prob} {prob_homozygous_dominant} {prob_heterozygous} {prob_homozygous_recessive}"
    )

    # Assuming the disease is recessive
    tree[child_id]["Has_HCM_Mendel"] = prob

    return tree[child_id]["Has_HCM_Mendel"]


get_probability(tree, 185330)
