FROM public.ecr.aws/lambda/python:3.10

COPY opensearchCollectionEntry.py /asset/
COPY requirements.txt /tmp/
RUN pip3 install -r /tmp/requirements.txt -t /asset