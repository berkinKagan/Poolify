import React, { useState } from 'react';
import { Card, List, Button, Radio, message, Typography, Empty, Progress, Modal, Form, Input, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

function Cart() {
  // State variables
  const [cartItems, setCartItems] = useState([]);
  const [swimmerBalance, setSwimmerBalance] = useState(200); // Example balance
  const [calendar, setCalendar] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvc: '',
    expDate: '',
  });

  // Sample saved cards (for testing)
  const [savedCards, setSavedCards] = useState([
    { cardNumber: '**** **** **** 1234', expDate: '12/25' },
    { cardNumber: '**** **** **** 5678', expDate: '08/26' },
  ]);

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
    if (currentStep === 1 && paymentMethod === 'Card' && !selectedCard) {
      message.warning('Please select a saved card or add a new one.');
      return;
    }
    if (currentStep === 1 && selectedCard === 'addNew') {
      setIsCardModalVisible(true);
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

  // Handler for closing the card modal
  const handleCardModalCancel = () => {
    setIsCardModalVisible(false);
  };

  // Handler for submitting card details
  const handleCardDetailsSubmit = () => {
    if (!cardDetails.cardNumber || !cardDetails.cvc || !cardDetails.expDate) {
      message.error('Please fill in all card details.');
      return;
    }

    setIsCardModalVisible(false);
    message.success('New card added successfully.');
    setSelectedCard(`**** **** **** ${cardDetails.cardNumber.slice(-4)}`);
  };

  // Handler for input change in card details form
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handler for selecting a card
  const handleCardSelection = (value) => {
    setSelectedCard(value);
  };

  // Handler for deleting a saved card
  const deleteSavedCard = (cardNumber) => {
    const updatedCards = savedCards.filter((card) => card.cardNumber !== cardNumber);
    setSavedCards(updatedCards);
    message.success('Card deleted successfully.');
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
                placeholder="Select a saved card or add a new one"
                style={{ width: '100%', marginTop: '20px' }}
                onChange={handleCardSelection}
              >
                {savedCards.map((card, index) => (
                  <Option key={index} value={card.cardNumber}>
                    {card.cardNumber} (Exp: {card.expDate})
                    <CloseOutlined
                      style={{ marginLeft: 8, color: 'red' }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent Select from triggering
                        deleteSavedCard(card.cardNumber);
                      }}
                    />
                  </Option>
                ))}
                <Option value="addNew">+ Add New Card</Option>
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
              Total Amount: <strong>${cartItems.reduce((sum, item) => sum + parseFloat(item.price.slice(1)), 0)}</strong>
            </Paragraph>
            <Button type="primary" block onClick={makePayment}>
              Make Payment
            </Button>
          </>
        )}
      </Card>

      {/* Card Details Modal */}
      <Modal
        title="Enter Card Details"
        visible={isCardModalVisible}
        onCancel={handleCardModalCancel}
        onOk={handleCardDetailsSubmit}
        okText="Save"
      >
        <Form layout="vertical">
          <Form.Item label="Card Number">
            <Input name="cardNumber" placeholder="1234 5678 9012 3456" maxLength={16} onChange={handleCardInputChange} />
          </Form.Item>
          <Form.Item label="CVC">
            <Input name="cvc" placeholder="123" maxLength={3} onChange={handleCardInputChange} />
          </Form.Item>
          <Form.Item label="Expiration Date">
            <Input name="expDate" placeholder="MM/YY" onChange={handleCardInputChange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Cart;
