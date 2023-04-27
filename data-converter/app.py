import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score
import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

# Define the Neo4j connection details
uri = os.environ.get("NEO4J_URI")
user = os.environ.get("NEO4J_USERNAME")
password = os.environ.get("NEO4J_PASSWORD")

# Connect to the Neo4j database
driver = GraphDatabase.driver(uri, auth=(user, password))

# Define the query to retrieve the Cat nodes with their features
query = """
    MATCH (c:Cat)
    OPTIONAL MATCH (c)<-[:SIRE]-(sire:Cat)
    OPTIONAL MATCH (c)<-[:DAM]-(dam:Cat)
    RETURN c.ID as ID,
        c.Sex as Sex,
        c.Inbreeding as Inbreeding,
        CASE c.HCM WHEN 'HCM' THEN True ELSE False END as Has_HCM,
        c.Sire as Sire_ID,
        CASE sire.HCM WHEN 'HCM' THEN True ELSE False END as Sire_has_HCM,
        c.Dam as Dam_ID,
        CASE dam.HCM WHEN 'HCM' THEN True ELSE False END as Dam_has_HCM
"""

# Execute the query and retrieve the data
with driver.session() as session:
    result = session.run(query)
    cat_data = pd.DataFrame(
        [r.values() for r in result], 
        columns=result.keys()
    )

# Close the Neo4j driver
driver.close()

# Save the pandas dataframe to a CSV file
cat_data.to_csv("data.csv", index=False)