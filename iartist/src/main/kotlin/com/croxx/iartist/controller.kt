package com.croxx.iartist

import org.springframework.stereotype.Controller
import org.springframework.ui.ModelMap
import org.springframework.web.bind.annotation.GetMapping

/**
 * @Author Croxx
 * @Date 2018/11/1
 * @Description
 */

@Controller
class WebController {

    @GetMapping(value = "/index")
    fun index(model: ModelMap): String {
        return "index"
    }

}