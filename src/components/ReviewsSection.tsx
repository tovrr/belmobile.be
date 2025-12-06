import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const MOCK_REVIEWS = [
    { id: 1, author: 'Jean Dupont', rating: 5, text: 'Service rapide et impeccable ! Mon iPhone est comme neuf.', date: '2 days ago' },
    { id: 2, author: 'Marie Peeters', rating: 5, text: 'Très bon accueil à Schaerbeek. Je recommande.', date: '1 week ago' },
    { id: 3, author: 'Ahmed Benali', rating: 4, text: 'Bon prix pour le rachat de mon Samsung.', date: '2 weeks ago' },
];

const ReviewsSection = ({ lang }: { lang: string }) => {
    return (
        <div className="mt-12 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <StarIcon className="h-6 w-6 text-yellow-400" />
                {lang === 'fr' ? 'Avis Clients' : lang === 'nl' ? 'Klantenbeoordelingen' : 'Customer Reviews'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_REVIEWS.map(review => (
                    <div key={review.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-bel-blue/10 rounded-full flex items-center justify-center text-bel-blue font-bold mr-3">
                                {review.author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{review.author}</div>
                                <div className="text-xs text-gray-500">{review.date}</div>
                            </div>
                        </div>
                        <div className="flex mb-3">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">"{review.text}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsSection;
