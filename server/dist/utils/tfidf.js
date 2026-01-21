export class TFIDF {
    constructor() {
        this.documents = [];
        this.terms = [];
        this.tfidfMatrix = [];
        this.idfMap = new Map();
        // Basic English stopwords
        this.stopWords = new Set([
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can't", "cannot", "could", "couldn't",
            "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each",
            "few", "for", "from", "further",
            "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
            "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
            "let's",
            "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not",
            "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
            "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
            "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
            "under", "until", "up",
            "very",
            "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
            "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
        ]);
    }
    /**
     * Tokenizes text into an array of words, removing punctuation and stopwords.
     */
    tokenize(text) {
        if (!text)
            return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "") // Remove punctuation
            .split(/\s+/)
            .filter((word) => word.length > 2 && !this.stopWords.has(word));
    }
    /**
     * Adds a document to the corpus.
     */
    addDocument(text) {
        this.documents.push(text);
    }
    /**
     * Calculates TF-IDF vectors for all documents in the corpus.
     */
    calculateTFIDF() {
        const tokenizedDocs = this.documents.map((doc) => this.tokenize(doc));
        // Get unique terms across all documents
        const uniqueTerms = new Set();
        tokenizedDocs.forEach((tokens) => {
            tokens.forEach((token) => uniqueTerms.add(token));
        });
        this.terms = Array.from(uniqueTerms);
        // Calculate IDF
        this.terms.forEach((term) => {
            let docCount = 0;
            tokenizedDocs.forEach((tokens) => {
                if (tokens.includes(term)) {
                    docCount++;
                }
            });
            // IDF = log(Total Documents / (Number of Documents containing the term))
            // Adding 1 to denominator to avoid division by zero
            this.idfMap.set(term, Math.log(this.documents.length / (docCount || 1)));
        });
        // Calculate TF-IDF
        this.tfidfMatrix = tokenizedDocs.map((tokens) => {
            const vec = new Array(this.terms.length).fill(0);
            // Calculate TF
            const termCounts = new Map();
            tokens.forEach((token) => {
                termCounts.set(token, (termCounts.get(token) || 0) + 1);
            });
            this.terms.forEach((term, index) => {
                const tf = (termCounts.get(term) || 0) / tokens.length;
                const idf = this.idfMap.get(term) || 0;
                vec[index] = tf * idf;
            });
            return vec;
        });
    }
    /**
     * Calculates cosine similarity between two vectors.
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Gets recommendations for a query text (e.g., user profile).
     * Returns indices of documents sorted by similarity score.
     */
    getRecommendations(query, limit = 10) {
        const queryTokens = this.tokenize(query);
        // Create query vector
        const queryVec = new Array(this.terms.length).fill(0);
        const termCounts = new Map();
        queryTokens.forEach((token) => {
            termCounts.set(token, (termCounts.get(token) || 0) + 1);
        });
        this.terms.forEach((term, index) => {
            if (this.idfMap.has(term)) {
                const tf = (termCounts.get(term) || 0) / queryTokens.length;
                const idf = this.idfMap.get(term) || 0;
                queryVec[index] = tf * idf;
            }
        });
        // Calculate similarity with all documents
        const scores = this.tfidfMatrix.map((docVec, index) => ({
            index,
            score: this.cosineSimilarity(queryVec, docVec),
        }));
        // Sort by score descending
        return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    }
}
