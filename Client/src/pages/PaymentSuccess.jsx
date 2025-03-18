import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentSuccess = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (sessionId) {
          const response = await axios.get(`/api/payment-success?session_id=${sessionId}`);
          setOrderDetails(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [sessionId]);

  if (loading) return <div>Loading order details...</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </div>

        {orderDetails && (
          <div className="mb-6 text-left">
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            <p>Order ID: {orderDetails.session.payment_intent}</p>
            <p>Amount: ${(orderDetails.session.amount_total / 100).toFixed(2)}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link to="/profile?tab=bookings" className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300">
            View My Tickets
          </Link>
          <Link to="/" className="block w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition duration-300">
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;