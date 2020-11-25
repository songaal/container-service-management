

test (debug mode)
docker run -d -p 8080:8080 dcr.danawa.io/alpine-webssh python run.py --address=0.0.0.0 --port=8080 --xsrf=False --origin="*" --maxconn=4000 --debug=True --xheaders=False --redirect=False


prod
docker run -d -p 8080:8080 dcr.danawa.io/alpine-webssh python run.py --address=0.0.0.0 --port=8080 --xsrf=False --origin="danawa.io" --maxconn=4000 --xheaders=False --redirect=False



docker run -d -p 3000:3000 -v %CD%:/data -e "smtp_user=" =e "smtp_password=" -e "session_timeout=60" -e "webssh_host=http://danawa.io:31002" -e "docker_compose_root_path=/data" -e "docker_compose_file_name=docker-compose.yml" dcr.danawa.io/service-management