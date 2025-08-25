import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import DocumentAnalysis from '@/components/DocumentAnalysis';

const DocumentAnalysisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DocumentAnalysis />
      </main>
      <Footer />
    </div>
  );
};

export default DocumentAnalysisPage;

