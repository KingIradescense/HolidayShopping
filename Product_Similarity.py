import json
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download NLTK resources
nltk.download("punkt")
nltk.download("stopwords")
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Load JSON File
def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

# Preprocess Product Text with NLTK
def preprocess_text(text):
    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()

    # Tokenize and lowercase
    tokens = word_tokenize(text.lower())

    # Remove stopwords and lemmatize
    processed = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word.isalnum() and word not in stop_words
    ]
    return " ".join(processed)

# Extract Product Texts
def extract_texts(products, field="Name"):
    return [preprocess_text(product.get(field, "")) for product in products]

# Vectorize Texts Using TF-IDF
def vectorize_texts(texts):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(texts)
    return vectors, vectorizer.get_feature_names_out()

# Calculate Similarity Scores
def calculate_similarity(vectors):
    return cosine_similarity(vectors)

# Generate Similar Product Recommendations
def generate_similarity_results(similarity_matrix, products, top_n=5):
    similarity_results = []

    for idx, product in enumerate(products):
        scores = list(enumerate(similarity_matrix[idx]))
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)

        similar_products = [
            {
                "Product ID": products[i]["Product ID"],
                "Name": products[i]["Name"],
                "Similarity Score": round(score, 2),
            }
            for i, score in sorted_scores[1:top_n + 1]
        ]

        similarity_results.append(
            {
                "Product ID": product["Product ID"],
                "Main Product": product["Name"],
                "Similar Products": similar_products,
            }
        )

    return similarity_results

# Save Results to JSON File
def save_to_json(data, file_path):
    with open(file_path, "w", encoding='utf-8') as file:
        json.dump(data, file, indent=2)
    print(f"Similarity results saved to {file_path}")

# Main Execution
if __name__ == "__main__":

    # Load products from JSON file
    json_file = "C:/Users/scarl/Desktop/Ghost Zone/college/fall 2024/mining/projects/downloaded example. thank god/HolidayShopping/valid_records.json"  # Replace with your file path
    products = load_json(json_file)

    print(f"Input Data: {products}")  # Assuming `products` holds the input JSON data; for debugging (confirm products is not blank)

    # Extract and preprocess product names
    product_texts = extract_texts(products, field="Name")

    # Vectorize product texts
    vectors, feature_names = vectorize_texts(product_texts)

    # Calculate similarity scores
    similarity_matrix = calculate_similarity(vectors)

    # Generate similarity results
    similarity_results = generate_similarity_results(similarity_matrix, products)

    print(f"Similarity Results: {similarity_results}") # for debugging (confirm if similarity_results is not empty)

    # Save similarity results to JSON
    output_file = "C:/Users/scarl/Desktop/Ghost Zone/college/fall 2024/mining/projects/downloaded example. thank god/HolidayShopping/product_similarity.json"  
    save_to_json(similarity_results, output_file)