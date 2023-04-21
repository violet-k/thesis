import math
import pandas as pd
import numpy as np

df = pd.read_csv("converted.csv")
data = df


def calculate_hcm_inheritance_prob(child_id, pedigree_df):
    """
    Calculate the probability of a child inheriting HCM from its parents,
    taking into account the HCM diagnoses of ancestors in the pedigree.

    Args:
        child_id (str): The ID of the child in the pedigree.
        pedigree_df (pd.DataFrame): The pedigree data in a pandas DataFrame.

    Returns:
        The probability of the child inheriting HCM.
    """

    child = pedigree_df.loc[pedigree_df['ID'] == child_id]
    child_hcm = child['Has_HCM'].item()
    
    # Get the IDs of the parents
    sire_id = child['Sire_ID'].item()
    if math.isnan(sire_id):
        prob =  0.75 if child_hcm else 0.25
        return prob

    dam_id = child['Dam_ID'].item()

    # Get the HCM diagnoses of the parents
    sire_hcm = child['Sire_has_HCM'].item()
    dam_hcm = child['Dam_has_HCM'].item()

    # Calculate the probability of inheriting HCM from the parents
    if sire_hcm and dam_hcm:
        # Both parents have HCM
        prob = 0.75
    elif sire_hcm or dam_hcm:
        # One parent has HCM
        prob = 0.5
    else:
        # Neither parent has HCM
        prob = 0.25

    # # Recursively calculate the probability of inheriting HCM from the ancestors
    # if sire_id and dam_id:
    #     prob *= calculate_hcm_inheritance_prob(sire_id, pedigree_df) * calculate_hcm_inheritance_prob(dam_id, pedigree_df)

    return prob


data['Probability'] = data.apply(lambda row : calculate_hcm_inheritance_prob(row['ID'], data), axis=1)
data.to_csv('results.csv', index=False)
