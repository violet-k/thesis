import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score


# Read the CSV file
df = pd.read_csv("results.csv")

# Convert the 'Sex' column to numeric values (e.g., 0 for 'm' and 1 for 'f')
df["Sex"] = df["Sex"].map({"M": 0, "F": 1})

def predict(df): 
    # Split the data into train and test sets, ensuring that each set contains at least 50% of cats with HCM = HCM
    df_train, df_test = train_test_split(
        df, test_size=0.2, stratify=df['Has_HCM']
    )

    # Split the data into train and test sets
    X_train = df_train.drop("Has_HCM", axis=1)
    X_test = df_test.drop("Has_HCM", axis=1)
    y_train = df_train["Has_HCM"]
    y_test = df_test["Has_HCM"]

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

    # Calculate mean cv score
    mean_cv_score = np.mean(cv_scores)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    
    # print("Cross-validation scores:", cv_scores)
    # print("Mean cross-validation score:", mean_cv_score)
    # print("Accuracy on test set:", accuracy)

    return [accuracy, mean_cv_score]

# Extract the required columns
cols = [
    "Sex", 
    "Has_HCM", 
    "Sire_has_HCM", 
    "Dam_has_HCM", 
    "Inbreeding", 
    "Probability"
]

def predict_batch(df):
    accuracy_list = []
    mean_cv_score_list = []
    for i in range(0, 100):
        [accuracy, mean_cv_score] = predict(df)
        accuracy_list.append(accuracy)
        mean_cv_score_list.append(mean_cv_score)
    print(f"Accuracy: {np.mean(accuracy_list)}")
    print(f"CV score: {np.mean(mean_cv_score_list)}\n")

# Without additional columns
predict_batch(df[cols[0:4]])
# With Inbreeding
predict_batch(df[cols[0:5]])
# With Probability
predict_batch(df[cols[0:4] + cols[5:]])
# With Inbreeding & Probability
predict_batch(df[cols])