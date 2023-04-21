import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

# Load the data
df = pd.read_csv('results_prob_2.csv')

# Extract the required columns
df = df[['Sex', 'Has_HCM', 'Sire_has_HCM', 'Dam_has_HCM', 'Probability']]

# # Load the data
# df = pd.read_csv('results.csv')

# # Extract the required columns
# df = df[['Sex', 'Has_HCM', 'Sire_has_HCM', 'Dam_has_HCM']]

# Convert categorical variables to one-hot encoded variables
encoder = OneHotEncoder(sparse=False)
df_encoded = pd.DataFrame(encoder.fit_transform(df[['Sex']]))
df_encoded.columns = encoder.get_feature_names(['Sex'])
df = pd.concat([df_encoded, df.drop('Sex', axis=1)], axis=1)

# Split the data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(df.drop('Has_HCM', axis=1), df['Has_HCM'], test_size=0.2, random_state=42)

# Train the model
model = XGBClassifier()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).mean()
print(f"Accuracy: {accuracy}")
