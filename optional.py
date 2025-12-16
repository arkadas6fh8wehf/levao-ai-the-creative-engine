"""
Optional Flask Backend for Lepen AI
Deploy this separately to keep the server alive during idle periods.

Requirements:
- pip install flask flask-cors requests

Usage:
- Set environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
- Run: python optional.py
- Deploy to your preferred hosting (Render, Railway, Heroku, etc.)
"""

import os
import requests
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://eedtqzfatasqkakhyuua.supabase.co')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZHRxemZhdGFzcWtha2h5dXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTA0OTUsImV4cCI6MjA4MDkyNjQ5NX0.V1fgVtEdqN7RCt_hKw3KyfY0ND9y4HDo9hgR0RIP6jA')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to keep server alive"""
    return jsonify({'status': 'ok', 'service': 'lepen-ai-backend'})

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Proxy chat requests to Supabase Edge Function"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        response = requests.post(
            f'{SUPABASE_URL}/functions/v1/chat',
            json=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            },
            stream=True
        )
        
        def generate():
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk
        
        return Response(
            generate(),
            content_type=response.headers.get('content-type', 'text/event-stream')
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-image', methods=['POST', 'OPTIONS'])
def generate_image():
    """Proxy image generation requests to Supabase Edge Function"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        response = requests.post(
            f'{SUPABASE_URL}/functions/v1/generate-image',
            json=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            }
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/web-search', methods=['POST', 'OPTIONS'])
def web_search():
    """Proxy web search requests to Supabase Edge Function"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        response = requests.post(
            f'{SUPABASE_URL}/functions/v1/web-search',
            json=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            }
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/map-search', methods=['POST', 'OPTIONS'])
def map_search():
    """Proxy map search requests to Supabase Edge Function"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        response = requests.post(
            f'{SUPABASE_URL}/functions/v1/map-search',
            json=data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
            }
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Keep-alive ping route
@app.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint for keep-alive services"""
    return 'pong'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
