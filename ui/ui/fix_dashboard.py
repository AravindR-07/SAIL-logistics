
lines = []
with open('c:/Users/Abeshek/Desktop/ui/ui/src/pages/Dashboard.tsx', 'r') as f:
    lines = f.readlines()

# Line 276 is index 275.
# Let's verify content before deleting
print(f"Deleting line 276: {lines[275]}")

# Delete index 275
del lines[275]

with open('c:/Users/Abeshek/Desktop/ui/ui/src/pages/Dashboard.tsx', 'w') as f:
    f.writelines(lines)
