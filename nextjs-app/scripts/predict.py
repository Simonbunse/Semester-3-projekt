import joblib
import pandas as pd
import numpy as np
import argparse
import os
import json  # Added for JSON output

# Get the absolute path to the script directory
script_dir = os.path.dirname(os.path.realpath(__file__))

# Define the absolute paths to the model and encoder
model_path = os.path.join(script_dir, 'parking_availability_model.pkl')
encoder_path = os.path.join(script_dir, 'onehot_encoder.pkl')

# Load the saved model and encoder
model = joblib.load(model_path)
encoder = joblib.load(encoder_path)

# Function to preprocess the user input data
def preprocess_user_input(street_name, between_streets, day_of_week, month, interval_of_day, day_of_month):
    # Map dayOfWeek and month to numerical values
    day_mapping = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
                   'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    month_mapping = {'January': 0, 'February': 1, 'March': 2, 'April': 3,
                     'May': 4, 'June': 5, 'July': 6, 'August': 7,
                     'September': 8, 'October': 9, 'November': 10, 'December': 11}

    # Ensure that the inputs are valid
    if day_of_week not in day_mapping:
        raise ValueError(f"Invalid dayOfWeek: {day_of_week}")
    if month not in month_mapping:
        raise ValueError(f"Invalid month: {month}")
    
    # Prepare the feature DataFrame
    user_input_data = pd.DataFrame({
        'streetName': [street_name],
        'betweenStreets': [between_streets],
        'dayOfWeek': [day_mapping[day_of_week]],
        'month': [month_mapping[month]],
        'IntervalOfDay': [interval_of_day],
        'dayOfMonth': [day_of_month]  # Added dayOfMonth as an input feature
    })

    return user_input_data

# Function to make the prediction with a confidence score
def predict_parking_availability(street_name, between_streets, day_of_week, month, interval_of_day, day_of_month):
    # Preprocess the user input
    user_data = preprocess_user_input(street_name, between_streets, day_of_week, month, interval_of_day, day_of_month)

    # Ensure the columns are in the correct order before encoding
    user_data = user_data[['betweenStreets', 'streetName', 'dayOfWeek', 'month', 'IntervalOfDay', 'dayOfMonth']]

    # OneHot encode the categorical features
    categorical_features = ['betweenStreets', 'streetName']
    encoded_data = encoder.transform(user_data[categorical_features])

    # Convert categorical features into a DataFrame
    encoded_columns = encoder.get_feature_names_out(categorical_features)
    encoded_df = pd.DataFrame(encoded_data, columns=encoded_columns)

    # Concatenate encoded categorical features with numerical features
    numerical_features = ['IntervalOfDay', 'dayOfWeek', 'month', 'dayOfMonth']  # Include dayOfMonth here
    user_data_numerical = user_data[numerical_features].reset_index(drop=True)
    final_input_data = pd.concat([encoded_df, user_data_numerical], axis=1)

    # Get the predicted probabilities for both classes
    prob = model.predict_proba(final_input_data)

    # The confidence score is the probability for the "parking available" class (True)
    confidence_score = prob[0][1]  # Index 1 corresponds to "True" (parking available)

    # Define a more detailed threshold for parking availability based on confidence
    if confidence_score >= 0.9:
        result = "Parking is very likely available."
    elif confidence_score >= 0.7:
        result = "Parking is likely available."
    elif confidence_score >= 0.5:
        result = "Parking availability is uncertain."
    elif confidence_score >= 0.3:
        result = "Parking is unlikely available."
    else:
        result = "Parking is very unlikely available."

    # Return the result and confidence score as a dictionary in JSON format
    return json.dumps({"result": result, "confidenceScore": confidence_score})

# Main function to parse arguments and execute the prediction
def main():
    # Setup argument parser for command-line inputs
    parser = argparse.ArgumentParser(description="Predict parking availability")
    parser.add_argument('street_name', type=str, help="Street name")
    parser.add_argument('between_streets', type=str, help="Streets between which parking is available")
    parser.add_argument('day_of_week', type=str, help="Day of the week")
    parser.add_argument('month', type=str, help="Month")
    parser.add_argument('interval_of_day', type=int, help="Interval of the day")
    parser.add_argument('day_of_month', type=int, help="Day of the month")

    # Parse the command-line arguments
    args = parser.parse_args()

    # Get the prediction with the confidence score
    result = predict_parking_availability(
        args.street_name, args.between_streets, args.day_of_week, args.month, args.interval_of_day, args.day_of_month
    )
    print(result)

if __name__ == "__main__":
    main()
