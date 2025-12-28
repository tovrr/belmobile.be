'use client';

import React from 'react';
import { Quote } from '../../types';
import BuybackQuoteDetails from './quotes/BuybackQuoteDetails';
import RepairQuoteDetails from './quotes/RepairQuoteDetails';

interface Props {
    quote: Quote;
    onClose: () => void;
}

const QuoteDetailsModal: React.FC<Props> = ({ quote, onClose }) => {
    // ROUTER LOGIC
    if (quote.type === 'buyback') {
        return <BuybackQuoteDetails quote={quote} onClose={onClose} />;
    }
    
    // Default to Repair for 'repair' or any legacy type
    return <RepairQuoteDetails quote={quote} onClose={onClose} />;
};

export default QuoteDetailsModal;
