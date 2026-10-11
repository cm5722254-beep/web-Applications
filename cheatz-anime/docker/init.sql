-- Create the test database alongside the main one
SELECT 'CREATE DATABASE cheatz_anime_testing'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cheatz_anime_testing')\gexec
