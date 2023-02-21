function calc_formula(formula_str) {
    /*
    
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

function is_num(char) {
    /**
     * これは数字か
     */
    const hex_dict = "0123456789ABCDEF";
    return (hex_dict.indexOf(char) != -1);
}
function is_op() {
    /**
     * これは計算記号か
     */
}


class Formula {
    constructor() {
        this.base = 10;
        this.formula_list = [];
    }
    display_num() {
        let last_key = this.formula_list[this.formula_list.length - 1];
        if (typeof last_key == 'number') {
            // 数字だった場合
            return last_key;
        } else if (last_key == '=') {
            let re = calc_formula(this.to_str().slice(0,-1));
            if (re != null) {
                return re;
            }
        }
        return 0;
    }
    push(key) {
        if (this.formula_list.length == 0) {
            this.formula_list.push(key);
        } else {
            let last_key = this.formula_list[this.formula_list.length - 1];
            if (typeof key == 'number' && typeof last_key == 'number') {
                this.formula_list[this.formula_list.length - 1] = last_key * this.base + key;
            } else if (typeof key == 'string' && typeof last_key == 'string') {
                // 上書き
                if (last_key == '=') {
                    this.formula_list= [calc_formula(this.to_str().slice(0, -1)), key];
                } else {
                    this.formula_list[this.formula_list.length - 1] = key;
                }
            } else {
                this.formula_list.push(key);
            }
        }
    }
    to_str() {
        return this.formula_list.join('');
    }
    change_base(base) {
        this.base = base;
        let last_key = this.formula_list[this.formula_list.length - 1];
        if (typeof last_key == "number") {
            this.formula_list.pop();
        }
    }
    clear() {
        this.formula_list = [];
    }
}

function gen_bin_html(val) {
    /*

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
    
    */
    const hex_dict = "0123456789ABCDEF";
    let hex_str = '';
    for (let i = 0; i < 16; i++) {
        if (i != 0 && i % 2 == 0) { hex_str = ' ' + hex_str; }
        hex_str = hex_dict[val & 0xF] + hex_str;
        val = (val >> 4);
    }
    return hex_str;
}

function update(formula) {
    let display_num = formula.display_num();
    let formula_str = formula.to_str();
    $('#dec_result_field').html(display_num);
    $('#bin_result_field').html(gen_bin_html(display_num));
    $('#hex_result_field').html(gen_hex_html(display_num));

    $('#formula').removeClass('warn'); // ******************

    $('#formula').text(formula_str);
}
function change_input_base(input_base, formula) {
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
    update(formula);
}

$(function () {
    let current_formula = new Formula();
    update(current_formula);

    $('.result').on('click', function (e) {
        let input_base = $(this).data('base');
        change_input_base(input_base, current_formula);
    });


    $('.result_icon').each(function () {
        $(this).width($(this).height());
        $(this).css('line-height', $(this).height() + 'px');
        $('#type').width($(this).height() + 'px');
    });

    $('#btn_clear').on('click', function () {
        current_formula.clear();
        update(current_formula);
    });

    // $('#btn_del').on('click', function () {
    //     current_formula = current_formula.slice(0, -1);
    //     update(current_formula);
    // });

    $('.num_btn').on('click', function () {
        console.log('num btn pushed0');
        let btn_key = $(this).data('key');
        const hex_dict = "0123456789ABCDEF";
        current_formula.push(hex_dict.indexOf(btn_key));
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
});