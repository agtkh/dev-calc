function calc_formula(formula_str) {
    /*
    現在の式を評価し、結果を返す。
    式が不正の場合はnullを返す。
    */
    let re;
    try {
        re = evalCalculation(formula_str);
    } catch (e) {
        if (e instanceof SyntaxError) {
            return null;
        } else {
            throw e;
        }
    }
    return re;
}
function char_to_hex_num(char) {
    const hex_dict = "0123456789ABCDEF";
    return hex_dict.indexOf(char);
}
function is_hex_num(char) {
    /**
     * これは16進数の数字か
     */
    return (char_to_hex_num(char) != -1);
}
function is_bin_num(char) {
    /**
     * これは2進数の数字か
     */

    const bin_dict = "01";
    return (bin_dict.indexOf(char) != -1);
}
function is_dec_num(char) {
    /**
     * これは10進数の数字か
     */
    const dec_dict = "0123456789";
    return (dec_dict.indexOf(char) != -1);
}
function is_op(char) {
    /**
     * これは計算記号か
     */
    const op_dict = "+-*/%<>~&|^()";
    return (op_dict.indexOf(char) != -1);
}


class Formula {
    /**
     * 計算式管理用のクラス
     */
    constructor() {
        this.base = 10;
        this.formula_list = [];
    }
    display_num() {
        /**
         * 結果画面に教示する数字を返す。
         * 数字入力中はその数字。
         * = の後は計算結果など
         */
        if (this.formula_list.length == 0) { return 0; }
        let last_key = this.formula_list[this.formula_list.length - 1];
        if (typeof last_key == 'number') {
            // 数字だった場合
            return last_key;
        } else if (last_key == '=') {
            let re = calc_formula(this.to_str().slice(0, -1));
            if (re != null) {
                return re;
            }
        }
        return 0;
    }
    push(key) {
        /**
         * 計算式に追加(入力)
         * 数値の入力と記号の入力を適切に追加する。
         */
        if (this.formula_list.length == 0) {
            this.formula_list.push(key);
        } else {
            let last_key = this.formula_list[this.formula_list.length - 1];
            if (typeof key == 'number' && typeof last_key == 'number') {
                this.formula_list[this.formula_list.length - 1] = last_key * this.base + key;
            } else if (typeof key == 'string' && typeof last_key == 'string') {
                // 連続の記号入力
                if (last_key == '=') {
                    // 結果を計算して計算式を更新
                    this.formula_list = [calc_formula(this.to_str().slice(0, -1))];
                    if (key != '=') { this.formula_list.push(key); }
                } else if (last_key != ')') {
                    // 上書き
                    this.formula_list[this.formula_list.length - 1] = key;
                } else {
                    this.formula_list.push(key);
                }
            } else {
                this.formula_list.push(key);
            }
        }
    }
    pop() {
        /**
         * 直近の削除
         */
        if (this.formula_list.length != 0) {
            let last_key = this.formula_list[this.formula_list.length - 1];
            if (typeof last_key == 'number') {
                this.formula_list[this.formula_list.length - 1] = parseInt(last_key / this.base);
            } else {
                this.formula_list.pop();
            }
        }

    }
    to_str() {
        /**
         * 数式を文字列化して返す。
         */
        if (this.formula_list.length == 0) { return '0'; }
        return this.formula_list.join('');
    }
    change_base(base) {
        /**
         * 入力のベース(進数)を変更する。
         */
        this.base = base;
        // let last_key = this.formula_list[this.formula_list.length - 1];
        // if (typeof last_key == "number") {
        //     // 入力途中の場合、入力中の数字を消す。
        //     this.formula_list.pop();
        // }
    }
    clear() {
        // 計算式のクリア
        this.formula_list = [];
    }
}

function gen_bin_html(val) {
    /*
    2進数表示用のhtmlを返す
    */
    let bin_str = '';
    for (let i = 0; i < 64; i++) {
        if (i == 32) {
            bin_str = '<br />' + bin_str;
        } else if (i != 0 && i % 4 == 0) {
            bin_str = ' ' + bin_str;
        }
        if (val & 1) {
            bin_str = '1' + bin_str;
        } else {
            bin_str = '0' + bin_str;
        }
        val = (val >> 1);
    }
    return bin_str;
}
function gen_hex_html(val) {
    /*
    16進数表示用のhtmlを返す
    */
    const hex_dict = "0123456789ABCDEF";
    let hex_str = '';
    for (let i = 0; i < 16; i++) {
        if (i != 0 && i % 4 == 0) { hex_str = ' ' + hex_str; }
        hex_str = hex_dict[val & 0xF] + hex_str;
        val = (val >> 4);
    }
    return hex_str;
}

function update(formula) {
    /**
     * 表示の更新
     */
    let display_n = formula.display_num();
    let formula_str = formula.to_str();
    $('#dec_result_field').html(display_n);
    $('#bin_result_field').html(gen_bin_html(display_n));
    $('#hex_result_field').html(gen_hex_html(display_n));

    $('#formula').removeClass('warn'); // ******************

    $('#formula').text(formula_str);
}
function change_input_base(input_base, formula) {
    /**
     * 入力ベース(base)の変更
     * 不必要ボタンの無効化など
     */
    $('.result.selected').removeClass('selected');
    $('.btn.disabled').removeClass('disabled');
    if (input_base == 'hex') {
        $('#hex_result').addClass('selected');
        formula.change_base(16);
    } else if (input_base == 'bin') {
        $('#bin_result').addClass('selected');
        $('.btn.bin_disable').addClass('disabled');
        formula.change_base(2);
    } else { // dec
        $('#dec_result').addClass('selected');
        $('.btn.dec_disable').addClass('disabled');
        formula.change_base(10);
    }
}
function currrent_input_base() {
    /**
     * 現在の入力進数(base)を返す
     */
    return $('.result.selected').first().data('base');
}
function next_input_base() {
    /**
     * 次の入力進数(base)を返す
     */
    let current_input_base = currrent_input_base();
    if (current_input_base == 'dec') {
        return 'hex';
    }
    else if (current_input_base == 'hex') {
        return 'bin';
    }
    else {
        return 'dec';
    }
}
function prev_input_base() {
    /**
     * 前の入力進数(base)を返す
     */
    let curr_input_base = currrent_input_base();
    if (curr_input_base == 'dec') {
        return 'bin';
    }
    else if (curr_input_base == 'hex') {
        return 'dec';
    }
    else {
        return 'hex';
    }
}
function fix_layout() {
    /**
     * HTMLレイアウトの調節
     */

    $('.btn').each(function () {
        let w = $(this).width();
        $(this).height(w);
        $(this).css('line-height', w + 'px');
    });
    // $('.result_icon').each(function () {
    //     // 
    //     let h = $(this).height();
    //     $(this).width(h);
    //     $(this).css('line-height', h + 'px');
    //     $('#type').width(h);
    // });
}
$(function () {
    fix_layout();
    $(window).on('resize', fix_layout);

    let current_formula = new Formula();
    update(current_formula);

    $('.result').on('click', function (e) {
        let input_base = $(this).data('base');
        change_input_base(input_base, current_formula);
        update(current_formula);
    });


    $('#btn_clear').on('click', function () {
        current_formula.clear();
        update(current_formula);
    });

    $('#btn_del').on('click', function () {
        current_formula.pop();
        update(current_formula);
    });

    $('.num_btn').on('click', function () {
        if ($(this).hasClass('disabled')) return;
        let btn_key = $(this).data('key');
        let num = "0123456789ABCDEF".indexOf(btn_key);
        current_formula.push(num);
        update(current_formula);
    });
    $('.op_btn').on('click', function () {
        let btn_key = $(this).data('key');
        current_formula.push(btn_key);
        update(current_formula);
    });
    $('#eq_btn').on('click', function () {
        current_formula.push('=');
        update(current_formula);
    });
    $(window).on('keydown', function (e) {
        // console.log('keydown:', e.key, e.keyCode);

        // 文字を数値に変換 (ex. f->15)
        let num = char_to_hex_num(e.key.toUpperCase());
        if (num != -1) {
            let curr_input_base = currrent_input_base();
            if ((curr_input_base == 'dec' && is_dec_num(num)) || (curr_input_base == 'bin' && is_bin_num(num)) || curr_input_base == 'hex') {
                // 数字の入力
                current_formula.push(num);
                update(current_formula);
                return false;
            }
        }

        if (is_op(e.key)) {
            // 記号の入力
            current_formula.push(e.key);
            update(current_formula);
            return false;
        }
        if (e.key == 'Enter') {
            current_formula.push('=');
            update(current_formula);
            return false;
        }
        if (e.key == 'Backspace' || e.key == 'Delete') {
            current_formula.pop();
            update(current_formula);
            return false;
        }
        if (e.key == 'ArrowUp' || e.key == 'ArrowLeft') {
            change_input_base(prev_input_base(), current_formula);
            update(current_formula);
            return false;
        }
        if (e.key == 'ArrowDown' || e.key == 'ArrowRight') {
            change_input_base(next_input_base(), current_formula);
            update(current_formula);
            return false;
        }
    });
});