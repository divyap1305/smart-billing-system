import axios from "axios";

const API_URL = "http://localhost:5000/api/invoices";

export const createInvoice = async (invoiceData) => {
  const response = await axios.post(API_URL, invoiceData);
  return response.data;
};

export const getInvoices = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};