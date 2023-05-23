build:
	docker build -t botopenai .

run:
	docker run -d -p 3000:3000 --name botopenai --restart always botopenai