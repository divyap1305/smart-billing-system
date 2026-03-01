import pickle
import numpy as np

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

future_day = np.array([[10]])
prediction = model.predict(future_day)

print("Predicted future sales:", int(prediction[0]))