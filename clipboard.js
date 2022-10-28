const clipboard = new ClipboardJS('#btn-copy');
        clipboard.on('success', function(e) {
            alert("복사 완료!");
            e.clearSelection();
        });

        clipboard.on('error', function(e) {
            alert("복사 실패! 다시 시도해주세요.");
        });


        $(document).ready(function() {
            $("#btn-reset").click(function(e){
            $("#text-source").val("");
            });

            $(".btn-transform").click(function (e) {
            const source = $('#text-source').val();
            if (!source) {
                alert("입력이 제대로 안된거 같은데요");
                return;
            }

            switch ($(e.target).data("mode")) {
            case "spam":
                $("#text-transformed").val(spammaker.toSpam(source));
                break;
            case "korean":
                $("#text-transformed").val(spammaker.toKorean(source));
                break;
            }

            });
        });

        const defaultPlaceholder = $("#text-source").attr("placeholder");
        $("#text-transformed").attr("placeholder", spammaker.toSpam(defaultPlaceholder));
        // console.log(spammaker.toSpam("동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세"));
        // console.log(spammaker.toKorean("이 별점 높은 숙소 사실 가보니 매우 구립니다 사장님은 불친절하고 조식은 드럽게 맛이 없어요 별 1개도 아깝습니다"))