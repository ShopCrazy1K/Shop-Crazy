import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WithdrawalSystem from './WithdrawalSystem';
import { DollarSign, Plus, CreditCard, Wallet } from 'lucide-react';

const AccountBalance: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(5);
  const [depositMethod, setDepositMethod] = useState<'card' | 'paypal' | 'venmo' | 'bank'>('card');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (depositAmount < 5) {
      alert('Minimum deposit is $5');
      return;
    }

    if (!userProfile) return;

    try {
      // In a real app, this would integrate with payment processors
      // For demo purposes, we'll just update the balance
      await updateUserProfile({
        balance: userProfile.balance + depositAmount
      });

      alert(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setShowDepositForm(false);
      setDepositAmount(5);
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert('Failed to process deposit');
    }
  };

  const [showWithdrawal, setShowWithdrawal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Wallet className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-600">Account Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ${userProfile?.balance.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowDepositForm(true)}
          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Money
        </button>
        
        <button
          onClick={() => setShowWithdrawal(true)}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          <CreditCard size={16} className="mr-2" />
          Withdraw
        </button>
      </div>

      {/* Deposit Form Modal */}
      {showDepositForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Add Money to Account</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Minimum $5)
                </label>
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  You will be charged ${depositAmount.toFixed(2)} via {depositMethod.toUpperCase()}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepositForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Deposit ${depositAmount.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal System */}
      {showWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <WithdrawalSystem />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountBalance;
