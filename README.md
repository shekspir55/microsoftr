# microsoftr = micro + softr

Inspired by "softr," microsoftr aims to simplify backend development, making it more accessible and manageable, especially for small projects, prototypes, or educational purposes where a full-fledged database system might be unnecessary or overly complex.

The application is designed to serve as a minimal backend system. Its primary function is to interface with **Google Spreadsheets** as a  database.

## Get Array Data from Sheet

- **Endpoint**: `/api/array-from-sheet`
- **Method**: `GET`
- **Description**: Retrieves data from a specified sheet within a spreadsheet and returns it in an array format. This endpoint is useful for when you need to process or display spreadsheet data as a list or sequence.
- **Query Parameters**:
  - `spreadsheetUrl`: The URL of the spreadsheet from which data is to be retrieved.
  - `sheet`: The name of the sheet within the spreadsheet.
  - `format`: A JSON string specifying the format or structure of the data to be returned.
- **Success Response**: A `200 OK` status with a JSON payload containing the formatted array data.
- **Error Response**: A `500 Internal Server Error` status with an error message.

## Get Object Data from Sheet

- **Endpoint**: `/api/object-from-sheet`
- **Method**: `GET`
- **Description**: This endpoint is designed to fetch data from a specified sheet within a spreadsheet and return it in an object format. It is particularly useful for scenarios where the data needs to be accessed as key-value pairs.
- **Query Parameters**:
  - `spreadsheetUrl`: The URL of the spreadsheet from which data is to be retrieved.
  - `sheet`: The name of the sheet within the spreadsheet.
  - `format`: A JSON string that specifies the format or structure of the data to be returned.
- **Success Response**: A `200 OK` status with a JSON payload containing the data in object format.
- **Error Response**: A `500 Internal Server Error` status with an error message.

## How to build and run locally.

##### Build docker image from source.
```
make build
```
or without cache
```
make build_no_cache
```

##### Run docker container with docker compose.
```
make up
```

##### Check service logs.
```
make logs
```

##### Restart all running services.
```
make restart
```

##### Down all services.
```
make down
```

That's All, Bye.