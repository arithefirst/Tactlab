#!/bin/sh

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