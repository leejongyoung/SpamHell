$(document).ready(function() {
    // ClipboardJS 초기화
    const clipboard = new ClipboardJS('#btn-copy');
    
    clipboard.on('success', function(e) {
        const btn = $(e.trigger);
        const originalText = btn.text();
        btn.text("복사 완료!").css("background", "#00cc82");
        
        setTimeout(() => {
            btn.text(originalText).css("background", "");
        }, 2000);
        
        e.clearSelection();
    });

    // 다시쓰기/초기화
    $("#btn-reset").click(function() {
        $("#text-source").val("");
        $("#text-transformed").val("");
        $("#preview-text-target").text("이곳에 변환된 메시지가 표시됩니다.");
    });

    // 변환 버튼
    $(".btn-transform").click(function() {
        const mode = $(this).data("mode");
        const source = $('#text-source').val();
        
        if (!source) {
            alert("메시지를 먼저 입력해주세요!");
            return;
        }

        let result = "";
        if (mode === "spam") {
            result = spammaker.toSpam(source);
        } else if (mode === "korean") {
            result = spammaker.toKorean(source);
        }
        
        updateResult(result);
    });

    // 퀵 템플릿
    $(".template-btn").click(function() {
        const type = $(this).data("template");
        const result = spammaker.getTemplate(type);
        updateResult(result);
        $("#text-source").val(`[${$(this).text().split(' ')[1]} 템플릿 적용됨]`);
    });

    // 결과 업데이트 공통 함수
    function updateResult(text) {
        $("#text-transformed").val(text);
        $("#preview-text-target").text(text); // 이미지 미리보기 영역 동기화
    }

    // 이미지로 저장하기 (html2canvas)
    $("#btn-save-image").click(function() {
        const target = document.getElementById("combined-card-area");
        
        // 텍스트가 비어있는지 확인
        if ($("#text-transformed").val() === "") {
            alert("먼저 메시지를 변환해주세요!");
            return;
        }

        const btn = $(this);
        btn.text("이미지 생성 중...").prop("disabled", true);

        html2canvas(target, {
            useCORS: true,
            backgroundColor: "#ffffff",
            scale: 2 // 고화질 저장
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `spamhell_justice_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            
            btn.text("📥 이미지로 저장하기").prop("disabled", false);
        }).catch(err => {
            console.error("Image generation failed", err);
            alert("이미지 생성에 실패했습니다.");
            btn.text("📥 이미지로 저장하기").prop("disabled", false);
        });
    });
});
