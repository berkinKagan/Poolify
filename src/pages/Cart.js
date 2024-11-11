import React, { useState } from 'react';
import { Card, List, Button, Radio, message, Typography, Empty, Progress } from 'antd';

const { Title, Paragraph } = Typography;

function Cart() {
  // State variables
  const [cartItems, setCartItems] = useState([]);
  const [swimmerBalance, setSwimmerBalance] = useState(200); // Example balance
  const [calendar, setCalendar] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [currentStep, setCurrentStep] = useState(0);

  // Sample cart data (for testing)
  const sampleCartData = [
    {
      classID: 'SW001',
      classType: 'Freestyle Swimming',
      classLevel: 'Beginner',
      date: '2024-12-10',
      time: '10:00',
      price: '$50',
    },
    {
      classID: 'SW002',
      classType: 'Butterfly Stroke',
      classLevel: 'Intermediate',
      date: '2024-12-12',
      time: '12:00',
      price: '$70',
    },
  ];

  // Initialize cart with sample data (for testing)
  if (cartItems.length === 0) {
    setCartItems(sampleCartData);
  }

  // Handler for removing a class from the cart
  const removeFromCart = (classID) => {
    const updatedCart = cartItems.filter((item) => item.classID !== classID);
    setCartItems(updatedCart);
    message.info('Class removed from cart.');
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
    setCurrentStep(currentStep + 1);
  };

  // Handler for making the payment
  const makePayment = () => {
    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.price.slice(1)), 0);

    if (totalAmount > swimmerBalance) {
      message.error('Insufficient balance!');
      return;
    }

    // Deduct the amount from swimmer's account
    setSwimmerBalance(swimmerBalance - totalAmount);
    message.success('Payment successful!');

    // Add classes to the swimmer's calendar
    const updatedCalendar = [...calendar, ...cartItems];
    setCalendar(updatedCalendar);

    // Clear the cart and reset the progress
    setCartItems([]);
    setCurrentStep(0);
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
              <Radio value="Credit Card">Credit Card</Radio>
              <Radio value="Debit Card">Debit Card</Radio>
              <Radio value="PayPal">PayPal</Radio>
              <Radio value="App Wallet">App Wallet</Radio>
            </Radio.Group>
            <Button type="primary" block onClick={nextStep}>
              Proceed to Payment
            </Button>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Complete Payment */}
            <Title level={4}>Complete Payment</Title>
            <Paragraph>
              Total Amount: <strong>${cartItems.reduce((sum, item) => sum + parseFloat(item.price.slice(1)), 0)}</strong>
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
