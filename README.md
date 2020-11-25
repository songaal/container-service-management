

test (debug mode)
docker run -d -p 8080:8080 dcr.danawa.io/alpine-webssh python run.py --address=0.0.0.0 --port=8080 --xsrf=False --origin="*" --maxconn=4000 --debug=True --xheaders=False --redirect=False


prod
docker run -d -p 8080:8080 dcr.danawa.io/alpine-webssh python run.py --address=0.0.0.0 --port=8080 --xsrf=False --origin="danawa.io" --maxconn=4000 --xheaders=False --redirect=False