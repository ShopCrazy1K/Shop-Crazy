import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

interface WithdrawalMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  fees: string;
}

const WithdrawalSystem: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10);
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    email: '',
    phoneNumber: '',
    accountName: ''
  });

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <Building2 size={24} />,
      description: 'Direct deposit to your bank account',
      minAmount: 10,
      maxAmount: 10000,
      processingTime: '1-3 business days',
      fees: 'Free'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <CreditCard size={24} />,
      description: 'Withdraw to your PayPal account',
      minAmount: 5,
      maxAmount: 5000,
      processingTime: 'Instant',
      fees: '2.9% + $0.30'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      icon: <Smartphone size={24} />,
      description: 'Send to your Venmo account',
      minAmount: 5,
      maxAmount: 3000,
      processingTime: 'Instant',
      fees: '1.5%'
    },
    {
      id: 'playplus',
      name: 'Play+ Card',
      icon: <Banknote size={24} />,
      description: 'Load to your Play+ prepaid card',
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instant',
      fees: 'Free'
    }
  ];

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod || !userProfile) return;

    if (withdrawalAmount < selectedMethod.minAmount) {
      alert(`Minimum withdrawal is $${selectedMethod.minAmount}`);
      return;
    }

    if (withdrawalAmount > selectedMethod.maxAmount) {
      alert(`Maximum withdrawal is $${selectedMethod.maxAmount}`);
      return;
    }

    if (withdrawalAmount > userProfile.balance) {
      alert('Insufficient balance');
      return;
    }

    // Calculate fees
    let fee = 0;
    if (selectedMethod.id === 'paypal') {
      fee = (withdrawalAmount * 0.029) + 0.30;
    } else if (selectedMethod.id === 'venmo') {
      fee = withdrawalAmount * 0.015;
    }

    const netAmount = withdrawalAmount - fee;

    try {
      // In a real app, this would integrate with payment processors
      // For demo purposes, we'll just update the balance
      await updateUserProfile({
        balance: userProfile.balance - withdrawalAmount,
        totalWinnings: userProfile.totalWinnings + netAmount
      });

      alert(`Withdrawal request submitted!\n\nAmount: $${withdrawalAmount.toFixed(2)}\nFees: $${fee.toFixed(2)}\nNet Amount: $${netAmount.toFixed(2)}\nProcessing Time: ${selectedMethod.processingTime}`);
      
      setShowWithdrawalForm(false);
      setSelectedMethod(null);
      setWithdrawalAmount(10);
      setWithdrawalDetails({
        accountNumber: '',
        routingNumber: '',
        email: '',
        phoneNumber: '',
        accountName: ''
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    }
  };

  const getRequiredFields = () => {
    if (!selectedMethod) return [];
    
    switch (selectedMethod.id) {
      case 'bank':
        return ['accountNumber', 'routingNumber', 'accountName'];
      case 'paypal':
        return ['email'];
      case 'venmo':
        return ['phoneNumber'];
      case 'playplus':
        return ['accountNumber'];
      default:
        return [];
    }
  };

  const calculateFee = () => {
    if (!selectedMethod) return 0;
    
    if (selectedMethod.id === 'paypal') {
      return (withdrawalAmount * 0.029) + 0.30;
    } else if (selectedMethod.id === 'venmo') {
      return withdrawalAmount * 0.015;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Available Balance</p>
        <p className="text-2xl font-bold text-green-600">
          ${userProfile?.balance.toFixed(2) || '0.00'}
        </p>
      </div>

      <button
        onClick={() => setShowWithdrawalForm(true)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Request Withdrawal
      </button>

      {/* Withdrawal Form Modal */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
            
            <form onSubmit={handleWithdrawal} className="space-y-6">
              {/* Withdrawal Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {withdrawalMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">{method.icon}</div>
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                          <p className="text-xs text-gray-500">
                            ${method.minAmount} - ${method.maxAmount} • {method.processingTime}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMethod && (
                <>
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <input
                      type="number"
                      min={selectedMethod.minAmount}
                      max={selectedMethod.maxAmount}
                      step="0.01"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Min: ${selectedMethod.minAmount} • Max: ${selectedMethod.maxAmount}
                    </p>
                  </div>

                  {/* Fee Calculation */}
                  {calculateFee() > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between text-sm">
                        <span>Withdrawal Amount:</span>
                        <span>${withdrawalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fees ({selectedMethod.fees}):</span>
                        <span>${calculateFee().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                        <span>You'll Receive:</span>
                        <span>${(withdrawalAmount - calculateFee()).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Required Fields */}
                  {getRequiredFields().map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field === 'accountNumber' && 'Account Number'}
                        {field === 'routingNumber' && 'Routing Number'}
                        {field === 'accountName' && 'Account Holder Name'}
                        {field === 'email' && 'PayPal Email'}
                        {field === 'phoneNumber' && 'Phone Number'}
                      </label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
                        value={withdrawalDetails[field as keyof typeof withdrawalDetails]}
                        onChange={(e) => setWithdrawalDetails({
                          ...withdrawalDetails,
                          [field]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}

                  {/* Processing Time Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Processing Time:</strong> {selectedMethod.processingTime}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll receive an email confirmation once your withdrawal is processed.
                    </p>
                  </div>
                </>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMethod}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalSystem;
