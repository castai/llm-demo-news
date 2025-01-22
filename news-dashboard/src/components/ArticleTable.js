import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Typography } from '@mui/material';

const ArticleTable = () => {
    const [articles, setArticles] = useState([]);
    const [filter, setFilter] = useState('all');

    const fetchArticles = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/articles?classified=${filter}`);
            setArticles(response.data.articles);
        } catch (error) {
            console.error("Error fetching articles:", error.response || error.message);
        }
    };

    useEffect(() => {
        // Initial fetch on component mount
        fetchArticles();

        // Set up polling interval to refresh articles every few seconds (e.g., 5 seconds)
        const intervalId = setInterval(() => {
            fetchArticles();
        }, 5000);  // 5000 milliseconds = 5 seconds

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [filter]);  // Rerun the effect if the filter changes

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 1000, margin: '0 auto', mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Articles</Typography>
            <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 2, display: 'block', margin: '0 auto' }}
            >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Classified</MenuItem>
                <MenuItem value="false">Unclassified</MenuItem>
            </Select>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Industry Category</TableCell>
                        <TableCell>Classification model</TableCell>
                        <TableCell>LLM Provider</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {articles.map((article) => (
                        <TableRow key={article.id}>
                            <TableCell>{article.id}</TableCell>
                            <TableCell>{article.date}</TableCell>
                            <TableCell>{article.title}</TableCell>
                            <TableCell>{article.sentiment != null ? article.sentiment : '-'}</TableCell>
                            <TableCell>{article.industry_category || '-'}</TableCell>
                            <TableCell>{article.classification_model || '-'}</TableCell>
                            <TableCell>
                            {article.provider
                                ? `${article.provider} (created by ${article.provider === 'Ollama' ? 'system' : 'user'})`
                                : article.classification_model
                                ? 'OpenAI (not registered)'
                                : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ArticleTable;