import ProductDetail from '../../../../../components/ProductDetail';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Product Detail | Belmobile',
    description: 'View product details.',
};

export function generateStaticParams() {
    return [];
}

export default function ProductDetailPage() {
    return <ProductDetail />;
}
