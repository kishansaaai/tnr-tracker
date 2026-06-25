import random
import uuid

def generate_sql():
    sql = """
-- Clear existing data
TRUNCATE TABLE medications, recoveries, updates, traps, cats, colonies CASCADE;

-- Default User Profile
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com') ON CONFLICT DO NOTHING;
INSERT INTO profiles (id, name, role) VALUES ('00000000-0000-0000-0000-000000000000', 'Demo User', 'admin') ON CONFLICT DO NOTHING;

"""
    # Major global cities (lat, lng) to cluster colonies around
    cities = [
        (35.6762, 139.6503), # Tokyo
        (40.7128, -74.0060), # New York
        (51.5074, -0.1278),  # London
        (-33.8688, 151.2093),# Sydney
        (48.8566, 2.3522),   # Paris
        (1.3521, 103.8198),  # Singapore
        (37.7749, -122.4194),# San Francisco
        (-23.5505, -46.6333),# Sao Paulo
        (28.6139, 77.2090),  # Delhi
        (55.7558, 37.6173),  # Moscow
        (34.0522, -118.2437),# Los Angeles
        (22.3193, 114.1694), # Hong Kong
        (-34.6037, -58.3816),# Buenos Aires
        (-33.9249, 18.4241), # Cape Town
    ]

    colony_ids = []
    
    # Generate 300 Colonies
    print("Generating 300 Colonies...")
    sql += "-- Colonies\nINSERT INTO colonies (id, name, lat, lng, status, description, created_by, created_at) VALUES\n"
    colony_values = []
    
    for i in range(300):
        c_id = str(uuid.uuid4())
        colony_ids.append(c_id)
        name = f"'Colony {i+1}'"
        
        # Pick a random city and add some jitter
        city = random.choice(cities)
        lat = city[0] + (random.uniform(-1.5, 1.5))
        lng = city[1] + (random.uniform(-1.5, 1.5))
        
        status = random.choice(["'managed'", "'managed'", "'in_progress'", "'in_progress'", "'unmanaged'"])
        created_by = "'00000000-0000-0000-0000-000000000000'"
        description = "'Automatically generated global colony data.'"
        
        colony_values.append(f"({repr(c_id)}, {name}, {lat}, {lng}, {status}, {description}, {created_by}, NOW())")

    sql += ",\n".join(colony_values) + ";\n\n"

    # Generate 1500 Cats
    print("Generating 1500 Cats...")
    sql += "-- Cats\nINSERT INTO cats (id, colony_id, name, gender, neutered, health_notes, photo_url, logged_by, created_at, pipeline_status, foster_name, adoption_date, adopter_info) VALUES\n"
    cat_values = []
    cat_ids = []
    
    for i in range(1500):
        cat_id = str(uuid.uuid4())
        cat_ids.append(cat_id)
        name = f"'Global Cat {i+1}'"
        colony_id = random.choice(colony_ids)
        gender = random.choice(["'unknown'", "'male'", "'female'"])
        
        is_neutered = random.random() > 0.4
        neutered = "true" if is_neutered else "false"
        
        health_notes = "'Standard health.'"
        photo_url = "''"
        logged_by = "'00000000-0000-0000-0000-000000000000'"
        pipeline_status = random.choice(["'tnr'", "'tnr'", "'tnr'", "'socializing'", "'adoption_ready'", "'adopted'"])
        
        cat_values.append(f"({repr(cat_id)}, {repr(colony_id)}, {name}, {gender}, {neutered}, {health_notes}, {photo_url}, {logged_by}, NOW(), {pipeline_status}, '', NULL, '')")
    
    sql += ",\n".join(cat_values) + ";\n\n"

    # Generate Traps (200 traps)
    print("Generating 200 Traps...")
    sql += "-- Traps\nINSERT INTO traps (id, colony_id, lat, lng, status, assigned_to, notes, created_at) VALUES\n"
    trap_values = []
    for i in range(200):
        t_id = str(uuid.uuid4())
        colony_id = random.choice(colony_ids)
        assigned_to = "'00000000-0000-0000-0000-000000000000'"
        
        city = random.choice(cities)
        lat = city[0] + (random.uniform(-1.5, 1.5))
        lng = city[1] + (random.uniform(-1.5, 1.5))
        
        status = random.choice(["'available'", "'in_use'", "'needs_pickup'"])
        
        trap_values.append(f"({repr(t_id)}, {repr(colony_id)}, {lat}, {lng}, {status}, {assigned_to}, 'Trap notes', NOW())")
    
    sql += ",\n".join(trap_values) + ";\n\n"

    # Generate Recoveries (100)
    print("Generating 100 Recoveries...")
    sql += "-- Recoveries\nINSERT INTO recoveries (id, cat_id, colony_id, surgery_type, surgery_date, release_date, status, vet_notes, created_by, created_at) VALUES\n"
    rec_values = []
    for i in range(100):
        r_id = str(uuid.uuid4())
        cat_id = random.choice(cat_ids)
        colony_id = random.choice(colony_ids)
        surgery_type = random.choice(["'spay_neuter'", "'medical'", "'dental'"])
        status = random.choice(["'recovering'", "'recovering'", "'released'"])
        created_by = "'00000000-0000-0000-0000-000000000000'"
        
        rec_values.append(f"({repr(r_id)}, {repr(cat_id)}, {repr(colony_id)}, {surgery_type}, NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', {status}, 'Vet notes', {created_by}, NOW())")
        
    sql += ",\n".join(rec_values) + ";\n"

    with open('supabase/seed.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
        
    print("Done! Wrote to supabase/seed.sql")

if __name__ == "__main__":
    generate_sql()
