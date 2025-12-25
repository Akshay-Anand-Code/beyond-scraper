import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [activeArticle, setActiveArticle] = useState(null);
    const [viewMode, setViewMode] = useState('updated');

    useEffect(() => {
        axios.get('/api/articles')
            .then(response => {
                setArticles(response.data);
                if (response.data.length > 0) {
                    setActiveArticle(response.data[0]);
                }
            });
    }, []);

    const handleArticleClick = (article) => {
        setActiveArticle(article);
        setViewMode('updated');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Article Manager</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex gap-6">
                    <div className="w-1/3 bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-bold">Articles List</div>
                        <ul className="divide-y divide-gray-200">
                            {articles.map((article) => (
                                <li 
                                    key={article.id} 
                                    onClick={() => handleArticleClick(article)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 ${activeArticle?.id === article.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <p className="text-sm font-medium text-gray-900">{article.title}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-2/3 bg-white shadow sm:rounded-lg p-6">
                        {activeArticle ? (
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900 w-3/4">{activeArticle.title}</h1>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('original')}
                                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'original' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                                        >
                                            Original
                                        </button>
                                        <button
                                            onClick={() => setViewMode('updated')}
                                            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'updated' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                                        >
                                            Updated
                                        </button>
                                    </div>
                                </div>

                                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg border">
                                    {viewMode === 'original' 
                                        ? "Original article content from BeyondChats." 
                                        : activeArticle.excerpt
                                    }
                                </div>

                                <div className="mt-6 pt-4 border-t">
                                    <a href={activeArticle.url} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View Source Article &rarr;
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center mt-10">Select an article to view details.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}