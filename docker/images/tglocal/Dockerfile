FROM ubuntu:latest
LABEL authors="dudosyka"

COPY data /root

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install make git zlib1g-dev libssl-dev gperf cmake clang-14 libc++-dev libc++abi-dev -y
RUN git clone --recursive https://github.com/tdlib/telegram-bot-api.git
WORKDIR /telegram-bot-api
RUN rm -rf build
RUN mkdir build
WORKDIR /telegram-bot-api/build
RUN CXXFLAGS="-stdlib=libc++" CC=/usr/bin/clang-14 CXX=/usr/bin/clang++-14 cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=.. ..
RUN cmake --build . --target install

EXPOSE 3000

CMD /root/telegram-bot-api --api-id=15813956 --api-hash=7e003ff0e80fb62698c1f6f1b0691c89 --http-port=3000