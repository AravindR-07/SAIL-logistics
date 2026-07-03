import pygame
import requests
import sys
import math
import time
import threading

# --- CONFIGURATION ---
WIDTH, HEIGHT = 1000, 700
BG_COLOR = (15, 23, 42)  # Slate-900
ACCENT_COLOR = (59, 130, 246) # Blue-500
TEXT_COLOR = (226, 232, 240)  # Slate-200
API_URL = "http://localhost:8000/api/state"
API_KEY = "dev-api-key-123"

# --- GEOGRAPHY CONFIG ---
# Bounding Box for the Map View (India + Indian Ocean + Australia)
# Top-Left (North-West) -> Bottom-Right (South-East)
MIN_LAT = -35.0  # South Australia
MAX_LAT = 30.0   # North India
MIN_LON = 80.0   # West Indian Ocean
MAX_LON = 155.0  # East Australia

# Fixed Locations (Lat, Lon) for Origins that might not be in API
FIXED_LOCATIONS = {
    'Australia': (-25.0, 135.0),
    'Indonesia': (-5.0, 105.0), # Approximate
    'USA': (10.0, 80.0), # Mapped to West Edge for "incoming from West"
    'Russia': (25.0, 80.0), # Mapped to North-West Edge
    'Paradip': (20.26, 86.67), # Fallback
    'Haldia': (22.02, 88.06), # Fallback
    'Visakhapatnam': (17.68, 83.21), # Fallback
    'Plant A': (23.55, 87.28), # Durgapur
    'Plant B': (23.63, 86.13), # Bokaro
}

class LogisticsVisualizer:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("SAIL Logistics Digital Twin - Live Monitor")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("Arial", 12) # Smaller font for dense map
        self.title_font = pygame.font.SysFont("Arial", 20, bold=True)
        
class LogisticsVisualizer:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("SAIL Logistics Digital Twin - Live Monitor")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("Arial", 12) 
        self.title_font = pygame.font.SysFont("Arial", 20, bold=True)
        self.tooltip_font = pygame.font.SysFont("Arial", 14, bold=True)
        
        self.running = True
        self.data_lock = threading.Lock()
        self.twin_state = {}
        
        # View Transform
        self.scale = 1.0
        self.offset_x = 0
        self.offset_y = 0
        self.is_dragging = False
        self.last_mouse_pos = (0, 0)
        
        # Data
        self.node_positions = {}
        self.fetch_thread = threading.Thread(target=self.bg_fetch_data, daemon=True)
        self.fetch_thread.start()
        self.update_node_positions()

    def project(self, lat, lon):
        """Converts Lat/Lon to Screen X/Y with Zoom/Pan."""
        # 1. Normalize to 0..1 (Mercator-ish)
        x_pct = (lon - MIN_LON) / (MAX_LON - MIN_LON)
        y_pct = (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)
        
        # 2. Base Screen Coords
        base_x = x_pct * WIDTH
        base_y = (1 - y_pct) * HEIGHT
        
        # 3. Apply Transform
        screen_x = (base_x * self.scale) + self.offset_x
        screen_y = (base_y * self.scale) + self.offset_y
        
        return int(screen_x), int(screen_y)

    def screen_to_geo(self, sx, sy):
        # Inverse projection (optional, for debugging clicks)
        pass

    def update_node_positions(self):
        # We calculate projection on draw now to support smooth zoom/pan
        pass

    def bg_fetch_data(self):
        while self.running:
            try:
                headers = {'X-API-KEY': API_KEY}
                resp = requests.get(API_URL, headers=headers, timeout=2)
                if resp.status_code == 200:
                    with self.data_lock:
                        self.twin_state = resp.json()
            except: pass
            time.sleep(1)

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1: # Left Click
                    self.is_dragging = True
                    self.last_mouse_pos = event.pos
                elif event.button == 4: # Wheel Up (Zoom In)
                    self.zoom(1.1, event.pos)
                elif event.button == 5: # Wheel Down (Zoom Out)
                    self.zoom(0.9, event.pos)
                    
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1:
                    self.is_dragging = False
            
            elif event.type == pygame.MOUSEMOTION:
                if self.is_dragging:
                    dx, dy = event.pos[0] - self.last_mouse_pos[0], event.pos[1] - self.last_mouse_pos[1]
                    self.offset_x += dx
                    self.offset_y += dy
                    self.last_mouse_pos = event.pos

    def zoom(self, factor, center):
        mouse_x, mouse_y = center
        
        # Move offset to keep mouse pointed at same world coord
        self.offset_x = mouse_x - (mouse_x - self.offset_x) * factor
        self.offset_y = mouse_y - (mouse_y - self.offset_y) * factor
        self.scale *= factor

    def draw_map(self):
        self.screen.fill((15, 23, 42)) 
        
        # 1. LANDMASSES
        self.draw_poly_landmass([
            (22.0, 69.0), (8.0, 77.0), (13.0, 80.0), (16.0, 82.0), (20.0, 87.0), (22.0, 89.0), (25.0, 92.0), (30.0, 80.0)
        ]) # India
        
        self.draw_poly_landmass([
            (-11.0, 130.0), (-12.0, 136.0), (-10.0, 142.0), (-15.0, 145.0), (-25.0, 153.0),
            (-38.0, 146.0), (-35.0, 135.0), (-32.0, 132.0), (-25.0, 113.0), (-22.0, 114.0)
        ]) # Australia
        
        self.draw_poly_landmass([(-5.0, 100.0), (0.0, 110.0), (-8.0, 115.0), (-8.0, 105.0)]) # Indo

        # 2. NODES & ROUTES (Dynamic)
        with self.data_lock:
            ports = self.twin_state.get('ports', {})
            plants = self.twin_state.get('plants', {})
            vessels = self.twin_state.get('vessels', {})
            rakes = self.twin_state.get('rakes', {})

        # Build position lookup for this frame
        curr_nodes = {}
        for k, coords in FIXED_LOCATIONS.items(): curr_nodes[k] = self.project(*coords)
        for p in ports.values(): curr_nodes[p['name']] = self.project(*p['coordinates'])
        for p in plants.values(): curr_nodes[p['name']] = self.project(*p['coordinates'])

        # Draw Sea Routes
        sea_routes = [('Australia', 'Paradip'), ('USA', 'Haldia'), ('Indonesia', 'Visakhapatnam')]
        for s, e in sea_routes:
            if s in curr_nodes and e in curr_nodes:
                pygame.draw.line(self.screen, (30, 58, 138), curr_nodes[s], curr_nodes[e], max(1, int(2*self.scale)))

        # Draw Rail Corridors
        corridors = [('Paradip', 'Plant A'), ('Paradip', 'Plant B'), ('Haldia', 'Plant A'), ('Visakhapatnam', 'Plant B')]
        for s, e in corridors:
            if s in curr_nodes and e in curr_nodes:
               pygame.draw.line(self.screen, (124, 45, 18), curr_nodes[s], curr_nodes[e], max(2, int(4*self.scale)))
               pygame.draw.line(self.screen, (249, 115, 22), curr_nodes[s], curr_nodes[e], max(1, int(2*self.scale)))

        # Draw Nodes
        mouse_pos = pygame.mouse.get_pos()
        hovered_text = None
        
        for name, pos in curr_nodes.items():
            # Culling: Don't draw if far off screen
            if not (-50 < pos[0] < WIDTH+50 and -50 < pos[1] < HEIGHT+50): continue
            
            # Draw Marker
            if 'Plant' in name:
                self.draw_factory(pos, (251, 146, 60))
            elif name in ['Australia', 'Indonesia', 'USA', 'Russia']:
                pygame.draw.circle(self.screen, (100, 116, 139), pos, int(5*self.scale))
            else:
                pygame.draw.circle(self.screen, (96, 165, 250), pos, int(6*self.scale))
                pygame.draw.circle(self.screen, (15, 23, 42), pos, int(2*self.scale))

            # Hover Check
            dist = math.hypot(pos[0]-mouse_pos[0], pos[1]-mouse_pos[1])
            if dist < 15:
                hovered_text = name # Set tooltip

            # Label (Draw if scale High OR hover, else skip to reduce clutter)
            if self.scale > 1.5 or dist < 50 or name in ['Paradip', 'Haldia']:
               self.draw_label(name, pos)

        # Draw Agents
        self.draw_agents_dynamic(vessels, rakes, curr_nodes, mouse_pos)
        
        # Tooltip Overlay
        if hovered_text:
             self.draw_tooltip(hovered_text, mouse_pos)

    def draw_poly_landmass(self, coords):
        pts = [self.project(lat, lon) for lat, lon in coords]
        if len(pts) > 2:
            pygame.draw.polygon(self.screen, (30, 41, 59), pts)
            pygame.draw.lines(self.screen, (71, 85, 105), True, pts, int(2*self.scale))

    def draw_agents_dynamic(self, vessels, rakes, node_lookup, mouse_pos):
        current_time = pygame.time.get_ticks() / 1000.0
        
        # Vessels
        for v in vessels.values():
            origin = node_lookup.get(v.get('origin', 'Australia'), node_lookup.get('Australia'))
            dest = node_lookup.get(v.get('assignedPort', 'Paradip'), node_lookup.get('Paradip'))
            if not origin or not dest: continue

            val = sum(ord(c) for c in v['id'])
            progress = (current_time * 0.05 + (val % 100)/100.0) % 1.0
            if v.get('status') == 'at_berth': pos = dest
            else: pos = (origin[0] + (dest[0]-origin[0])*progress, origin[1] + (dest[1]-origin[1])*progress)
            
            # Draw
            size = max(6, 10 * self.scale)
            if not (-50 < pos[0] < WIDTH+50 and -50 < pos[1] < HEIGHT+50): continue # Cull
            
            self.draw_ship_icon(self.screen, pos[0], pos[1], size)
            
            if math.hypot(pos[0]-mouse_pos[0], pos[1]-mouse_pos[1]) < 20:
                 self.draw_tooltip(f"{v['name']} ({v['cargo_type']})", (pos[0], pos[1]-20))

        # Rakes
        # Rakes
        # Valid Routes that we draw lines for
        valid_routes = [
            ('Paradip', 'Plant A'), 
            ('Paradip', 'Plant B'),
            ('Haldia', 'Plant A'), 
            ('Visakhapatnam', 'Plant B')
        ]
        
        for i, (r_id, r) in enumerate(rakes.items()):
            # Try to determine route from data
            target_plant = r.get('assigned_plant_id') or ''
            
            # Map Backend IDs to Visualizer Nodes
            if 'Durgapur' in target_plant: dest_key = 'Plant A'
            elif 'Bokaro' in target_plant: dest_key = 'Plant B'
            else: dest_key = None
            
            if dest_key:
                # Pick a valid route ending at this plant
                possible = [rt for rt in valid_routes if rt[1] == dest_key]
                if possible:
                    # Deterministic choice based on ID
                    idx = sum(ord(c) for c in r_id) % len(possible)
                    origin_name, dest_name = possible[idx]
                else:
                     origin_name, dest_name = valid_routes[0]
            else:
                 # Fallback: Round Robin across all routes
                 idx = sum(ord(c) for c in r_id) % len(valid_routes)
                 origin_name, dest_name = valid_routes[idx]

            origin = node_lookup.get(origin_name)
            dest = node_lookup.get(dest_name)
            
            if not origin or not dest: continue
            
            val = sum(ord(c) for c in r_id)
            progress = (current_time * 0.08 + (val % 100)/100.0) % 1.0
            pos = (origin[0] + (dest[0]-origin[0])*progress, origin[1] + (dest[1]-origin[1])*progress)

            if not (-50 < pos[0] < WIDTH+50 and -50 < pos[1] < HEIGHT+50): continue

            self.draw_train_icon(self.screen, pos[0], pos[1], max(6, 10*self.scale))
            
            # Tooltip
            if math.hypot(pos[0]-mouse_pos[0], pos[1]-mouse_pos[1]) < 15:
                 self.draw_tooltip(f"Rake {r['id']} -> {dest_name}", (pos[0], pos[1]-20))

    def draw_ship_icon(self, surface, x, y, size):
        s = size / 2
        pygame.draw.polygon(surface, (96, 165, 250), [(x-s, y), (x+s, y), (x+s*0.7, y+s), (x-s*0.7, y+s)])
        pygame.draw.line(surface, (200, 200, 200), (x, y), (x, y-s), 2)

    def draw_train_icon(self, surface, x, y, size):
        s = size / 2
        pygame.draw.rect(surface, (251, 146, 60), (x-s, y-s, size, size*0.8))

    def draw_factory(self, pos, color):
        x, y = pos
        s = 5 * self.scale
        pts = [(x-s, y+s), (x+s, y+s), (x+s, y-s*0.5), (x+s*0.5, y-s*0.5), 
               (x+s*0.5, y-s), (x, y-s*0.5), (x, y-s), (x-s*0.5, y-s*0.5), 
               (x-s*0.5, y-s), (x-s, y-s*0.5)]
        pygame.draw.polygon(self.screen, color, pts)

    def draw_label(self, text, pos):
        # High contrast label
        bg = self.font.render(text, True, (0, 0, 0))
        fg = self.font.render(text, True, (255, 255, 255))
        # Draw stroke effect
        for dx, dy in [(-1,-1),(-1,1),(1,-1),(1,1)]:
            self.screen.blit(bg, (pos[0]+8+dx, pos[1]-8+dy))
        self.screen.blit(fg, (pos[0] + 8, pos[1] - 8))

    def draw_ui(self):
        # Title Box
        title = self.title_font.render("Logistics Control Tower", True, (255, 255, 255))
        self.screen.blit(title, (20, 20))
        
        sub = self.font.render("Live Tracking | Connected to Localhost:8000", True, (148, 163, 184))
        self.screen.blit(sub, (20, 50))
        
        # Legend (Simple)
        # pygame.draw.rect(self.screen, (30, 41, 59), (20, HEIGHT - 100, 200, 80), border_radius=8)
        # pygame.draw.rect(self.screen, (255, 255, 255), (20, HEIGHT - 100, 200, 80), 1, border_radius=8)

    def draw_tooltip(self, text, pos):
        lbl = self.tooltip_font.render(text, True, (255, 255, 255))
        bg_rect = lbl.get_rect(topleft=(pos[0]+10, pos[1]))
        bg_rect.inflate_ip(10, 6)
        pygame.draw.rect(self.screen, (15, 23, 42), bg_rect)
        pygame.draw.rect(self.screen, (59, 130, 246), bg_rect, 1) # Border
        self.screen.blit(lbl, (pos[0]+15, pos[1]+3))

    def run(self):
        while self.running:
            self.handle_input()
            self.draw_map()
            self.draw_ui()
            pygame.display.flip()
            self.clock.tick(60)
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    app = LogisticsVisualizer()
    app.run()
