#!/bin/sh

## Replace baked public ENV vars
VAR="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
if [ -z "$(eval echo \$$VAR)" ]; then
    echo "$VAR is not set. Please set it and rerun the script."
    exit 1
fi

find /app/public /app/.next -type f -name "*.js" |
while read file; do
    sed -i "s|pk_live_Y2xlcmsudGFjdGxhYi5hcml0aGVmaXJzdC5jb20k|$(eval echo \$$VAR)|g" "$file"
done

## Run DB Migrations

max_retries=6
count=1

while [ $count -le $max_retries ]; do
  echo "Running Drizzle migrations... (Attempt $count/$max_retries)"
  if bunx drizzle-kit migrate; then
    echo "Drizzle migrations completed."
    exec "$@"
    exit 0
  else
    echo "Migration failed. Retrying in 5 seconds..."
    sleep 5
    count=$((count + 1))
  fi
done

echo "Drizzle migrations failed after $max_retries attempts. Container will not start."
exit