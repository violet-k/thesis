import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score

# Read the CSV file
df = pd.read_csv("results.csv")

print(df["Sex"].isnull().values.any())

# Extract the required columns
data = df[
    [
        "Sex",
        "Has_HCM",
        "Sire_has_HCM",
        "Dam_has_HCM"
        #  , "Probability"
    ]
]


# Convert the 'Sex' column to numeric values (e.g., 0 for 'm' and 1 for 'f')
data["Sex"] = data["Sex"].map({"m": 0, "f": 1})

# Fill missing values
data["Sex"].fillna(data["Sex"].mode()[0], inplace=True)
data["Sire_has_HCM"].fillna(data["Sire_has_HCM"].mean(), inplace=True)
data["Dam_has_HCM"].fillna(data["Dam_has_HCM"].mean(), inplace=True)
# data["Probability"].fillna(data["Probability"].mean(), inplace=True)

# Split the data into train and test sets
X = data.drop("Has_HCM", axis=1)
y = data["Has_HCM"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train a Gradient Boosted Decision Tree model
model = GradientBoostingClassifier()
model.fit(X_train, y_train)

# Predict the 'Has_HCM' value for the test set
y_pred = model.predict(X_test)

# Calculate the accuracy of the model
accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)
