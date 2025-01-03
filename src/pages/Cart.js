import React, { useState, useEffect } from 'react';
import { Card, List, Button, Radio, message, Typography, Empty, Progress, Select } from 'antd';
import { getUserFromLocalStorage } from '../Auth';
import apiClient from '../apiClient';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function Cart() {
  // State variables
  const [cartItems, setCartItems] = useState([]);
  const [swimmerBalance, setSwimmerBalance] = useState(); // Example balance
  const [calendar, setCalendar] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [currentStep, setCurrentStep] = useState(0);
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
  const [selectedCard, setSelectedCard] = useState(null);
  const [existingCards, setExistingCards] = useState([]);
  const [accountBalance, setAccountBalance] = useState(0.0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await apiClient.get(`/api/cart/${currentUser.userID}`);
        setCartItems(response.data);
      } catch (error) {
        message.error('Failed to fetch cart items. Please try again.');
        console.error(error);
      }
    };

    if (currentUser?.userRole === 'swimmer') {
      fetchCartItems();
      fetchExistingCards(currentUser.userID);
      fetchAccountBalance(currentUser.userID);
      console.log(existingCards);
    }
  }, [currentUser]);

  const fetchAccountBalance = async (userID) => {
    try {
      const response = await apiClient.get(`/api/users/account_balance/${userID}`);
      setAccountBalance(response.data.account_balance); // Update state with the balance
      setSwimmerBalance(response.data.account_balance);
    } catch (error) {
      message.error('Failed to fetch account balance. Please try again.');
      console.error(error);
    }
  };

  // Handler for removing a class from the cart
  const removeFromCart = async (classID) => {
    console.log('Removing class:', classID);
    try {
      await apiClient.delete(`/api/cart/${currentUser.userID}`, { data: { classID } });
      setCartItems((prevItems) => prevItems.filter((item) => item.classID !== classID));
      message.info('Class removed from cart.');
    } catch (error) {
      message.error('Failed to remove class from cart. Please try again.');
      console.error(error);
    }
  };

  // Handler for proceeding to the next step
  const nextStep = () => {
    if (currentStep === 0 && (cartItems || []).length === 0) {
      message.warning('Your cart is empty.');
      return;
    }
    if (currentStep === 1 && !paymentMethod) {
      message.warning('Please select a payment method.');
      return;
    }
    if (currentStep === 1 && paymentMethod === 'Card' && !selectedCard) {
      message.warning('Please select a saved card.');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const fetchExistingCards = async (userID) => {
    try {
      const response = await apiClient.get(`/api/payment/cards`, {
        params: { userID },
      });
      setExistingCards(response.data);
    } catch (error) {
      message.error('Failed to fetch cards. Please try again.');
      console.error(error);
    }
  };
  const clearCart = async () => {
    try {
      await apiClient.delete(`/api/cart/clear/${currentUser.userID}`);
      setCartItems([]); // Clear cart in the frontend
      message.success('Cart cleared successfully!');
    } catch (error) {
      message.error('Failed to clear cart. Please try again.');
      console.error(error);
    }
  };
  
  // Handler for making the payment
  const makePayment = async () => {
    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    console.log(cartItems);
    console.log('Total Amount:', totalAmount);
    console.log('Swimmer Balance:', swimmerBalance);
  
    if (totalAmount > swimmerBalance) {
      message.error('Insufficient balance!');
      return;
    }
  
    try {
      const response = await apiClient.post('/api/payment/deduct', {
        userID: currentUser.userID,
        amount: totalAmount,
      });
  
      message.success('Payment successful!');
      setSwimmerBalance(response.data.newBalance); // Update balance
      await clearCart(); // Clear cart
      setCartItems([]); // Clear cart

      for (const item of cartItems) {
        try {
          await apiClient.post('/api/participates_in/', {
            userID: currentUser.userID,
            classID: item.classID,
          });
        } catch (participationError) {
          console.error(`Failed to add participation for class ${item.classID}:`, participationError);
          message.error(`Failed to add participation for class ${item.classID}.`);
        }
      }
      
      setCalendar([...calendar, ...cartItems]); // Add classes to calendar
      setCurrentStep(0); // Reset progress
    } catch (error) {
      message.error('Payment failed. Please try again.');
      console.error(error);
    }
  };
  

  // Handler for selecting a card
  const handleCardSelection = (value) => {
    setSelectedCard(value);
  };

  // Progress Bar Step Descriptions
  const stepDescriptions = ['Review Cart', 'Select Payment Method', 'Complete Payment'];

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Card title="Your Cart" style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        {/* Progress Bar */}
        <Progress
          percent={(currentStep / 2) * 100}
          steps={3}
          format={() => stepDescriptions[currentStep]}
        />

        {currentStep === 0 && (
          <>
            {/* Cart Overview */}
            {(cartItems || []).length === 0 ? (
              <Empty description="No items in your cart yet." />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={cartItems}
                renderItem={(item) => (
                  <Card style={{ marginBottom: '10px' }}>
                    <Title level={4}>{item.classType}</Title>
                    <Paragraph><strong>Level:</strong> {item.classLevel}</Paragraph>
                    <Paragraph><strong>Date:</strong> {item.date}</Paragraph>
                    <Paragraph><strong>Time:</strong> {item.time}</Paragraph>
                    <Paragraph><strong>Price:</strong> {item.price}</Paragraph>
                    <Button type="link" danger onClick={() => removeFromCart(item.classID)}>
                      Remove
                    </Button>
                  </Card>
                )}
              />
            )}
            <Button type="primary" block onClick={nextStep}>
              Proceed to Payment Method
            </Button>
          </>
        )}

        {currentStep === 1 && (
          <>
            {/* Select Payment Method */}
            <Title level={4}>Select Payment Method</Title>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginBottom: '20px' }}
            >
              <Radio value="Card">Card</Radio>
              <Radio value="App Wallet">App Wallet</Radio>
            </Radio.Group>

            {paymentMethod === 'Card' && (
              <Select
                placeholder="Select a saved card"
                style={{ width: '100%', marginTop: '20px' }}
                onChange={handleCardSelection} // This will set selectedCard to the cardID
              >
                {existingCards.map((card) => (
                  <Option key={card.cardID} value={card.cardID}>
                    Card ID: {card.cardID}
                  </Option>
                ))}
              </Select>
            )}


            <Button type="primary" block onClick={nextStep}>
              Proceed to Payment
            </Button>
          </>
        )}

        {currentStep === 2 && (
          <>
            <Title level={4}>Complete Payment</Title>
            <Paragraph>
              Total Amount: <strong>${cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0)}</strong>
            </Paragraph>
            <Button type="primary" block onClick={makePayment}>
              Make Payment
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default Cart;
