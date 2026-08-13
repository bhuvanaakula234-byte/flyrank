-- Initialize tasks/items table for FlyRank Backend AI Engineering assignment
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial sample data
INSERT INTO items (title, description, status) 
VALUES 
    ('BE-04 Containerize Stack', 'Run Postgres in Docker and connect Node.js API layer', 'in_progress'),
    ('A2 Service Integration', 'Swap memory repository for Postgres repository', 'completed')
ON CONFLICT DO NOTHING;
