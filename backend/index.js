const cors = require("cors");
const express = require("express");
const axios = require("axios");


// Create an Express app
const app = express();
const apiData  = {
    companyName: "",
    clientID: "",
    ownerName: "",
    ownerEmail: "",
    rollNo: "",
    clientSecret: "",
  };

// Initialize an empty authentication token
let authToken = "";
async function obtainToken(apiData) {
    try {
      const response = await axios.post("http://20.244.56.144/train/auth", apiData);
      const token = response.data.access_token;
      return token;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  }

// Function to fetch train data from the API
async function fetchTrainsData() {
    const auth_token = await obtainToken(apiData);
    try {
      const headers = {
        Authorization: `Bearer ${auth_token}`,
      };
      const response = await axios.get("http://20.244.56.144/train/trains", {
        headers,
      });
      const trainsData = response.data;
      return trainsData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

// Function to sort the train data
function customQuickSort(arr) {
    function compare(a, b) {
      const priceComparison = a.price - b.price;
      if (priceComparison !== 0) {
        return priceComparison;
      }
  
      const seatsAvailableComparison = b.seatsAvailable - a.seatsAvailable;
      if (seatsAvailableComparison !== 0) {
        return seatsAvailableComparison;
      }
  
      const departureTimeA = a.departureTime.Hours * 60 + a.departureTime.Minutes + a.departureDelay;
      const departureTimeB = b.departureTime.Hours * 60 + b.departureTime.Minutes + b.departureDelay;
      
      return departureTimeB - departureTimeA;
    }
  
    if (arr.length <= 1) {
      return arr;
    }
  
    const pivot = arr[0];
    const left = [];
    const right = [];
  
    for (let i = 1; i < arr.length; i++) {
      if (compare(arr[i], pivot) < 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
  
    return [...customQuickSort(left), pivot, ...customQuickSort(right)];
  }

// Route for getting and sorting train data
app.get("/", async (req, res) => {
    try {
      const trainsData = await fetchTrainsData();
      const sortedTrains = customQuickSort(trainsData);
      const filteredTrains = sortedTrains.filter(train => train.departureTime.Minutes > 30);
      res.json(filteredTrains);
    } catch (error) {
      console.error("Error:", error);
      res.status(200).json({ error: error.message });
    }
  });
  

// Route for getting data of a specific train
app.get("/getTrain/:trainId", async (req, res) => {
    try {
      const trainNumber = req.params.trainId;
      const auth_token = await obtainToken(apiData);
  
      const headers = {
        Authorization: `Bearer ${auth_token}`,
      };
  
      const trainData = await axios.get(`http://20.244.56.144/train/trains/${trainNumber}`, { headers });
      res.json(trainData.data);
    } catch (error) {
      console.error("Unable to fetch data", error);
      res.status(200).json({ error: "Something went wrong" });
    }
  });
  

// Start the Express server
app.listen(8000, () => {
    console.log("Server is running on port http://localhost:8000");
  });
  