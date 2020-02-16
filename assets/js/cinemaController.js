function search(param) {

    var input = param.value.split(' ').join('.');
    console.log(input)
    var formdata = new FormData();
    formdata.append("search", input);

    fetch(`/cinema`, {
        method: "POST",
        body: formdata
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            if (typeof data.results == 'object') {
                console.log(data)
            } else {
                $('#searchResults').empty();
                for (let x in data) {
                        $('#searchResults').append(`
                        <div class="col-md-6 col-lg-4">
                                    <div class="portfolio-item mx-auto">
                                        <div class="card text-center text-primary">
                                            <div class="card-header p-0">
                                            <span><i>${data[x].title}</i></span><br>
                                            </div>
                                            <div class="card-body">
                                                <div class="m-0">
                                                    <div class="container">
                                                    <span><i>Uploaded: ${data[x].uploaded}</i></span><br>
                                                    <span><i>Size: ${data[x].size}</i></span><br>
                                                    <span><i>Seeds: ${data[x].seeders}</i></span><br>
                                                    <span><i>Leech: ${data[x].leechers}</i></span><br>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="container p-2" style=" height:40vh; width:100%">
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                    `)
                }
            }
        })
}
