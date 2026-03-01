import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle

data = pd.read_csv("sales.csv")

data["day"] = range(len(data))

X = data[["day"]]
y = data["total"]

model = LinearRegression()
model.fit(X, y)

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained successfully")