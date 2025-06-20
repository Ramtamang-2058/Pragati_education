# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements/ requirements/
RUN pip install -r requirements/production.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]