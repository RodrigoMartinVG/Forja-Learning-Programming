CC := cc
CFLAGS := -Wall -Wextra -std=c11

app: main.o greet.o
	$(CC) main.o greet.o -o app

main.o: main.c greet.h
	$(CC) $(CFLAGS) -c main.c -o main.o

greet.o: greet.c greet.h
	$(CC) $(CFLAGS) -c greet.c -o greet.o

clean:
	rm -f app main.o greet.o