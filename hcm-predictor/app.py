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
    RETURN
    c.ID as ID,
    c.Name as Name,
    c.Sex as Sex,
    c.Sire as Sire,
    c.Dam as Dam,
    c.HCM as HCM
"""

# Execute the query and retrieve the data
with driver.session() as session:
    result = session.run(query)
    cat_data = [record for record in result]

# Close the Neo4j driver
driver.close()

# Split the data into train and test sets, ensuring that each set contains at least 50% of cats with HCM = HCM
cat_data_train, cat_data_test = train_test_split(
    cat_data, test_size=0.2, stratify=[record["HCM"] for record in cat_data]
)

# Retrieve the IDs of the cats in each set
cat_ids_train = [record["ID"] for record in cat_data_train]
cat_ids_test = [record["ID"] for record in cat_data_test]


# Read the CSV file
df = pd.read_csv("results.csv")

# Convert the 'Sex' column to numeric values (e.g., 0 for 'm' and 1 for 'f')
df["Sex"] = df["Sex"].map({"m": 0, "f": 1})

# Split the dataframe into two based on the two lists of IDs
df_train = df[df["ID"].isin(cat_ids_train)]
df_test = df[df["ID"].isin(cat_ids_test)]

# Extract the required columns
cols = ["Sex", "Has_HCM", "Sire_has_HCM", "Dam_has_HCM", "Probability"]
data_train = df[cols]
data_test = df[cols]


# Split the data into train and test sets
X_train = data_train.drop("Has_HCM", axis=1)
X_test = data_test.drop("Has_HCM", axis=1)
y_train = data_train["Has_HCM"]
y_test = data_test["Has_HCM"]


# Train a Gradient Boosted Decision Tree model using StratifiedKFold cross-validation
gbdt = GradientBoostingClassifier(random_state=42)
cv = StratifiedKFold(n_splits=5, random_state=42, shuffle=True)
cv_scores = []

for train_index, test_index in cv.split(X_train, y_train):
    X_train_fold, X_test_fold = X_train.iloc[train_index], X_train.iloc[test_index]
    y_train_fold, y_test_fold = y_train.iloc[train_index], y_train.iloc[test_index]

    gbdt.fit(X_train_fold, y_train_fold)
    y_pred_fold = gbdt.predict(X_test_fold)
    accuracy = accuracy_score(y_test_fold, y_pred_fold)
    cv_scores.append(accuracy)

# Fit the model on the entire dataset
gbdt.fit(X_train, y_train)

# Predict HCM values using the test set
y_pred = gbdt.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("Cross-validation scores:", cv_scores)
print("Mean cross-validation score:", np.mean(cv_scores))
print("Accuracy on test set:", accuracy)
