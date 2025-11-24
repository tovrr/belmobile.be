import React from 'react';
import { Quote } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QuoteDetailsModalProps {
    quote: Quote;
    onClose: () => void;
}

const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({ quote, onClose }) => {
    const { updateQuoteStatus } = useData();
    const { shops } = useData();
    const shopName = shops.find(s => s.id === quote.shopId)?.name || 'Unknown Shop';

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'new' | 'processing' | 'responded' | 'closed';
        updateQuoteStatus(quote.id, newStatus);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-bel-dark capitalize">
                        {quote.type} Quote Details
                    </h2>
                    <p className="text-sm text-gray-500">Request ID: {quote.id}</p>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-800">Customer Details</h3>
                            <p><strong>Name:</strong> {quote.customerName}</p>
                            <p><strong>Email:</strong> {quote.customerEmail}</p>
                            <p><strong>Phone:</strong> {quote.customerPhone}</p>
                            <p><strong>Shop:</strong> {shopName}</p>
                        </div>
                        <div>
                             <h3 className="font-semibold text-gray-800">Device Details</h3>
                            <p><strong>Type:</strong> {quote.deviceType}</p>
                            <p><strong>Brand:</strong> {quote.brand}</p>
                            <p><strong>Model:</strong> {quote.model}</p>
                            {quote.type === 'buyback' && <p><strong>Condition:</strong> {quote.condition}</p>}
                        </div>
                    </div>
                     {quote.type === 'repair' && (
                        <div>
                            <h3 className="font-semibold text-gray-800">Issue Description</h3>
                            <p className="p-2 bg-gray-50 rounded border">{quote.issue}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Update Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={quote.status}
                            onChange={handleStatusChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue"
                        >
                            <option value="new">New</option>
                            <option value="processing">Processing</option>
                            <option value="responded">Responded</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailsModal;
